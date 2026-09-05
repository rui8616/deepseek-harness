# Agent Note: Japanese as a built-in locale

Status: implemented

English | [中文](2026-09-05-japanese-as-built-in-locale.zh.md)

## Problem

The client shipped `zh` and `en` as its built-in locales, and the [full rollout decision](2026-07-30-client-locale-full-rollout.md) closed that set deliberately: further languages were to arrive as language-pack plugins calling `addLanguage` plus per-namespace single-locale dictionary registration. Japanese was requested as product-level support rather than an optional pack. A pack cannot deliver that: the single-locale `register(ns, locale, dict)` form takes an untyped `LocaleDict`, so a namespace the pack has not covered — including every namespace added after the pack was written — silently falls back to English. That is exactly the mixed-language UI the [locale-owned copy decision](2026-08-23-locale-owned-client-ui-copy.md) exists to prevent, and no gate would catch it.

## Decision

**`ja` joins `LOCALE_IDS` as a third built-in locale.** `BuiltInLocaleId` widens with it, so the typed `register(ns, dicts)` overload now requires `Record<'zh' | 'en' | 'ja', LocaleDictOf<N>>`. Every one of the 35 registration sites is a compile error until its namespace ships a Japanese dictionary, and a key added to one locale alone fails to compile. Completeness is the compiler's job, not a reviewer's. The cost this accepts is that third-party client plugins must now supply three dictionaries to use the typed form; the single-locale form remains available to them and to language packs.

`zh` stays the key-set source of truth (Chinese-first repo convention) and `en` stays `FALLBACK_LOCALE`. English remains both the opening locale for a browser naming no registered language and the dictionary consulted after the active locale misses a key, because every shipped dictionary declares one key set across all three ids — a browser naming no registered language is the reader least likely to read Chinese or Japanese.

**The document tag becomes a locale property.** `LocaleDefinition` and `LanguageRegistration` gain an optional `documentLang`, validated as a BCP 47-style tag. `zh` declares `zh-CN`; `en` and `ja` are unambiguous as their own ids. `syncDocumentLanguage` reads the active definition instead of special-casing one id, so a language pack whose id is not the right `<html lang>` value can now say so.

**Japanese gets its own font stack.** The base stack names Simplified Chinese families (`PingFang SC`, `Hiragino Sans GB`, `Microsoft YaHei`). Han characters shared between the two languages carry Chinese glyph forms in those files — 直, 骨, 今, 令, 海 and many more differ — and `<html lang>` selects the document language without selecting the glyph variant, which follows from which font file resolves first. `ui-theme`'s `base.css` therefore overrides `--dsw-font-family` and `--ds-font-family-code` under `:root:lang(ja)`, reading the `lang` attribute the locale plugin already maintains.

**The parity gate measures every built-in locale against the base.** `locale-dictionary-parity.spec.ts` now carries `SHIPPED_LOCALES` and `BASE_LOCALE` instead of a hardcoded `zh`/`en` pair: discovery admits `ja` in all four naming shapes it already accepted for the other two, inline registration tables are keyed by the locale count rather than the literal 2, and each locale's key set is compared against the base so one report names the dictionary that drifted. A group missing any built-in locale is an error, not a skip.

## Verification

The parity gate covers all 35 discovered dictionary groups across `zh`/`en`/`ja`. `LocaleRuntime` specs move their external-language cases from `ja` to `ko`, which the package does not register, and assert the three-locale catalog with its document tags. The document-language spec pins `ja` resolving to a bare `ja` tag while `zh` still resolves to `zh-CN`.

## Alternatives considered

**Ship Japanese as a language-pack plugin.** This is the path [the earlier decision](2026-07-30-client-locale-full-rollout.md) reserved, and it leaves the existing packages untouched. Rejected for product-level support because the single-locale registration form carries no key-set check: a namespace the pack misses renders English with nothing failing. A gate asserting pack coverage of every discovered namespace would close that hole, but it would reimplement, outside the type system, the completeness the typed overload already enforces.

**Keep the set closed and give the pack a typed registration form.** A `register<N>(ns, locale, LocaleDictOf<N>)` overload would type-check pack dictionaries. Rejected because the pack must then type-import every client package to merge `LocaleNamespaceMap`, concentrating a reverse dependency on 33 packages in one place, and nothing would still require the pack to grow when a new namespace ships.

## Consequences

- A new client namespace needs three dictionaries, not two; the compiler names the omission at the registration site.
- Third-party client plugins using the typed `register` overload must supply a Japanese dictionary. The single-locale form is unaffected.
- `addLanguage({ id: 'ja', … })` now throws `already registered`; packs targeting Japanese contribute dictionaries instead.
- The Language row lists three options, and a `ja-JP` browser resolves Japanese with no stored preference.
