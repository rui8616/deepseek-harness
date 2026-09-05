/**
 * Gate for the invariant `FALLBACK_LOCALE` rests on: every shipped dictionary
 * declares one key set across every built-in locale.
 *
 * The locale runtime resolves a key through the active locale, then through
 * the single fallback locale (`en`), then surfaces the key itself. With
 * symmetric dictionaries that middle step always resolves, so one constant can
 * serve as both the opening locale and the dictionary fallback. A key added to
 * only some locales breaks that: a reader of a language missing it sees a bare
 * key such as `list.aria` instead of text. This gate fails on the asymmetry
 * rather than waiting for the bare key to reach a UI.
 *
 * Discovery is deliberately broad, because a gate that silently narrows is
 * worse than no gate. It sweeps every workspace package (not just
 * `packages/client`), reads dictionaries wherever they are declared —
 * `locales.ts`, a `locales/` directory, or inline in the plugin body — and
 * pairs `zh`/`en` across sibling files as well as within one module. A `zh`
 * dictionary whose `en` counterpart cannot be found anywhere is an error, not
 * a skip.
 */

import type { Dirent } from 'node:fs'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * Built-in locale ids, mirroring `LOCALE_IDS` in dsh-client-locale. Every
 * discovered dictionary must declare all of them; the first is the key-set
 * source of truth the others are measured against (Chinese-first repo
 * convention). Each id is two characters, which `localeOf` relies on when it
 * splits a prefixed or suffixed dictionary name.
 */
const SHIPPED_LOCALES = ['zh', 'en', 'ja'] as const

/** One built-in locale id. */
type ShippedLocale = typeof SHIPPED_LOCALES[number]

/** The locale whose key set the others are compared against. */
const BASE_LOCALE: ShippedLocale = 'zh'

/** The capitalized suffix form of a locale id (`zh` to `Zh`), as used in `settingsZh`. */
function suffixForm(locale: ShippedLocale): string {
  return (locale[0] ?? '').toUpperCase() + locale.slice(1)
}

/**
 * Whether a string literal names a built-in locale.
 * @param value - the literal text of a registration's locale argument.
 * @returns true when the value is one of {@link SHIPPED_LOCALES}.
 */
function isShippedLocale(value: string): value is ShippedLocale {
  return (SHIPPED_LOCALES as readonly string[]).includes(value)
}

const root = fileURLToPath(new URL('..', import.meta.url))

/** Repo-relative path with `/` separators, so messages and suffix tests match on every OS. */
function relative(file: string): string {
  return file.slice(root.length).replaceAll('\\', '/')
}

/** Every `.ts` source file under each workspace package's `src`, excluding declarations. */
function sourceFiles(): string[] {
  const files: string[] = []
  const packagesRoot = resolve(root, 'packages')
  for (const group of directories(packagesRoot)) {
    for (const pkg of directories(resolve(packagesRoot, group))) {
      walk(resolve(packagesRoot, group, pkg, 'src'), files)
    }
  }
  return files.sort()
}

/** Immediate subdirectory names, or none when the path is not a directory. */
function directories(dir: string): string[] {
  return readEntries(dir).filter(entry => entry.isDirectory()).map(entry => entry.name)
}

/**
 * Directory entries, treating only a genuinely absent directory as empty.
 * Any other failure (`EACCES`, I/O) rethrows: silently reading it as "absent"
 * would narrow the sweep and let the gate pass while checking less.
 * @param dir - absolute directory path.
 * @returns entries, or none when the directory does not exist.
 */
function readEntries(dir: string): Dirent[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw error
  }
}

function walk(dir: string, out: string[]): void {
  for (const entry of readEntries(dir)) {
    const full = resolve(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) out.push(full)
  }
}

/** One discovered dictionary: which file and export name declared it. */
interface Dictionary {
  /** Repo-relative declaring file. */
  file: string
  /** Export name, or the registration site for an inline literal. */
  name: string
  /** Declared keys, sorted. */
  keys: string[]
}

/**
 * Keys of every top-level `export const <name> = { ... }` object literal whose
 * name identifies a locale dictionary, plus inline `register(ns, locale, {...})`
 * literals. Read from the AST so the gate never executes package code.
 * @param file - absolute path of a candidate module.
 * @returns discovered dictionaries, keyed by locale-bearing name.
 */
function dictionariesIn(file: string): Dictionary[] {
  const text = readFileSync(file, 'utf8')
  // Cheap pre-filter: parsing every package source is wasteful. The pattern
  // must admit every shape `localeOf` accepts, or a file would be skipped
  // before parsing — the silent narrowing this gate exists to prevent. A bare
  // `\b(zh|en|ja)\b` misses `zhSettings`/`accessZh`, because `\b` does not hold
  // between `h` and an uppercase letter.
  if (!/\b(zh|en|ja)\b|\b(zh|en|ja)[A-Z]|(Zh|En|Ja)\b/.test(text)) return []
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.ESNext, true)
  const found: Dictionary[] = []
  const rel = relative(file)

  // Module-scope variable declarations, keyed by name. A 3-arg
  // `register(NS, 'zh'|'en', dict)` whose third argument is an identifier —
  // e.g. a local dictionary variable rather than an inline literal — resolves
  // through here so the gate still verifies its symmetry.
  const moduleConsts = new Map<string, ts.Expression>()
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const decl of statement.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.initializer !== undefined) {
        moduleConsts.set(decl.name.text, decl.initializer)
      }
    }
  }

  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue
    if (statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) !== true) continue
    for (const decl of statement.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name)) continue
      const literal = unwrap(decl.initializer)
      if (literal === undefined || !ts.isObjectLiteralExpression(literal)) continue
      if (localeOf(decl.name.text) === undefined) continue
      found.push({ file: rel, name: decl.name.text, keys: keysOf(literal) })
    }
  }

  // A 3-arg `register(ns, 'zh'|'en', dict)` call whose dictionary argument we
  // cannot turn into an object literal. We refuse instead of skipping: a
  // registration we cannot measure is exactly the silent narrowing this gate
  // exists to catch.
  const refuse = (ns: string, tag: string, why: string): never => {
    throw new Error(`cannot verify register('${ns}', '${tag}', ...) in ${rel}: ${why}`)
  }

  // Inline registrations, two shapes. A `[['zh', {...}], ['en', {...}], …]`
  // table handed to a registration loop keys off the enclosing array; separate
  // `register(NS, 'zh', {...})` / `register(NS, 'en', {...})` calls key off the
  // namespace argument, so those calls group with each other.
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const callee = node.expression
      const name = ts.isPropertyAccessExpression(callee)
        ? callee.name.text
        : ts.isIdentifier(callee) && callee.text === 'register' ? 'register' : undefined
      if (name === 'register' && node.arguments.length >= 3) {
        const [ns, tag, dict] = node.arguments
        if (ns === undefined || tag === undefined || !ts.isStringLiteral(tag)) return
        if (!isShippedLocale(tag.text)) return
        const raw = unwrap(dict)
        const literal = raw !== undefined && ts.isIdentifier(raw)
          ? (() => {
            const resolved = moduleConsts.get(raw.text)
            return resolved === undefined ? undefined : unwrap(resolved)
          })()
          : raw
        const why = raw !== undefined && ts.isIdentifier(raw)
          ? `third argument ${raw.text} does not resolve to an inline or module-scope object literal`
          : 'third argument is neither an object literal nor a resolvable dictionary variable'
        if (literal === undefined || !ts.isObjectLiteralExpression(literal)) {
          // The dictionary argument must resolve to an object literal; the
          // gate refuses rather than skips, so the symmetry it verifies never
          // silently narrows.
          refuse(ns.getText(source), tag.text, why)
        }
        const dictionary: ts.ObjectLiteralExpression = literal as ts.ObjectLiteralExpression
        // The namespace expression's source text identifies the pair, so the
        // zh and en calls for one namespace meet and calls for different
        // namespaces stay apart.
        found.push({ file: rel, name: `${tag.text}@register:${ns.getText(source)}`, keys: keysOf(dictionary) })
      }
    }
    if (ts.isArrayLiteralExpression(node) && node.elements.length === SHIPPED_LOCALES.length) {
      const site = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1
      for (const element of node.elements) {
        if (!ts.isArrayLiteralExpression(element) || element.elements.length !== 2) continue
        const [tag, dict] = element.elements
        const literal = unwrap(dict)
        if (tag === undefined || !ts.isStringLiteral(tag)) continue
        if (literal === undefined || !ts.isObjectLiteralExpression(literal)) continue
        if (!isShippedLocale(tag.text)) continue
        found.push({ file: rel, name: `${tag.text}@inline:${site}`, keys: keysOf(literal) })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return found
}

/** Declared property names of an object literal, sorted. */
function keysOf(literal: ts.ObjectLiteralExpression): string[] {
  const keys: string[] = []
  for (const prop of literal.properties) {
    if (!ts.isPropertyAssignment(prop)) continue
    if (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) keys.push(prop.name.text)
  }
  return keys.sort()
}

/** Look through `satisfies`/`as`/parenthesized wrappers to the literal. */
function unwrap(node: ts.Expression | undefined): ts.Expression | undefined {
  let current = node
  while (
    current !== undefined
    && (ts.isSatisfiesExpression(current) || ts.isAsExpression(current) || ts.isParenthesizedExpression(current))
  ) {
    current = current.expression
  }
  return current
}

/**
 * The locale a dictionary name declares, and the namespace-ish remainder that
 * identifies which group it belongs to. `zh`/`en`/`ja`, `zhSettings`, and
 * `settingsZh`/`accessJa` are the shapes this repo uses. A name-prefix shape
 * requires an uppercase ASCII letter at the third position (`[A-Z]`),
 * matching the admission of the cheap pre-filter, so `zh2Foo`/`zh_probe`
 * cannot be treated as dictionaries in one place and skipped in another.
 * Every id in {@link SHIPPED_LOCALES} is two characters, so the prefix and
 * suffix slices below hold for all of them.
 * @param name - export name or synthetic inline name.
 * @returns locale plus group key, or undefined when the name names no locale.
 */
function localeOf(name: string): { locale: ShippedLocale; pair: string } | undefined {
  for (const locale of SHIPPED_LOCALES) {
    const other = suffixForm(locale)
    if (name === locale) return { locale, pair: '' }
    // Synthetic names for inline shapes carry their own pair key after the
    // first ':' (the enclosing array's line, or the namespace expression).
    if (name.startsWith(`${locale}@`)) return { locale, pair: name.slice(name.indexOf(':')) }
    if (name.startsWith(locale) && name.length > 2 && /[A-Z]/.test(name[2] ?? '')) {
      return { locale, pair: name.slice(2) }
    }
    if (name.endsWith(other)) return { locale, pair: name.slice(0, -2) }
  }
  return undefined
}

describe('shipped locale dictionaries', () => {
  it('declares one key set across every built-in locale, so the single fallback locale always resolves', () => {
    const files = sourceFiles()
    // Guard the discovery itself: an empty or narrowed sweep would pass every
    // assertion below while checking nothing.
    expect(files.length).toBeGreaterThan(500)

    // Pair within a file first; a dictionary whose counterpart is not in the
    // same module then pairs with a sibling in the same directory. Both shapes
    // ship here: `locales/settings.ts` exports zh+en together, while
    // `locales/zh.ts` + `locales/en.ts` split the common pair across files.
    const perFile = new Map<string, Dictionary[]>()
    for (const file of files) {
      const dicts = dictionariesIn(file)
      if (dicts.length > 0) perFile.set(relative(file), dicts)
    }

    const groups = new Map<string, Map<ShippedLocale, Dictionary>>()
    const place = (key: string, locale: ShippedLocale, dict: Dictionary): void => {
      const slot = groups.get(key) ?? new Map<ShippedLocale, Dictionary>()
      if (slot.has(locale)) {
        throw new Error(`two ${locale} dictionaries claim pair ${key}: ${slot.get(locale)?.file} and ${dict.file}`)
      }
      slot.set(locale, dict)
      groups.set(key, slot)
    }

    for (const [rel, dicts] of perFile) {
      for (const dict of dicts) {
        const parsed = localeOf(dict.name)
        if (parsed === undefined) continue
        const sameFileCounterpart = dicts.some((other) => {
          const otherParsed = localeOf(other.name)
          return otherParsed !== undefined
            && otherParsed.pair === parsed.pair
            && otherParsed.locale !== parsed.locale
        })
        // Same-file groups key by file so two groups in one directory stay
        // distinct; split groups key by directory so siblings meet.
        const key = sameFileCounterpart ? `${rel}::${parsed.pair}` : `${dirname(rel)}::${parsed.pair}`
        place(key, parsed.locale, dict)
      }
    }

    const problems: string[] = []
    let comparedGroups = 0
    for (const [key, slot] of [...groups].sort()) {
      const absent = SHIPPED_LOCALES.filter(locale => !slot.has(locale))
      if (absent.length > 0) {
        const present = [...slot.values()][0]
        problems.push(`${present?.file} declares ${present?.name} with no counterpart for ${absent.join(', ')} in group ${key}`)
        continue
      }
      comparedGroups++
      // Every locale is measured against the base rather than against its
      // neighbour, so one report names the dictionary that drifted.
      const base = slot.get(BASE_LOCALE)
      /* v8 ignore next -- the absent check above already proved every locale is present. */
      if (base === undefined) continue
      for (const locale of SHIPPED_LOCALES) {
        if (locale === BASE_LOCALE) continue
        const other = slot.get(locale)
        /* v8 ignore next -- same guarantee as above. */
        if (other === undefined) continue
        const baseOnly = base.keys.filter(k => !other.keys.includes(k))
        const otherOnly = other.keys.filter(k => !base.keys.includes(k))
        if (baseOnly.length > 0) problems.push(`${base.file} ${base.name} has keys absent from ${other.name}: ${baseOnly.join(', ')}`)
        if (otherOnly.length > 0) problems.push(`${other.file} ${other.name} has keys absent from ${base.name}: ${otherOnly.join(', ')}`)
      }
    }

    // The shipped dictionary count only grows; a collapse means discovery or
    // grouping broke, which would hide real asymmetry.
    expect(comparedGroups).toBeGreaterThan(25)
    expect(problems).toEqual([])
  })
})
