# Agent Note: Native constructor source matched by grammar, not V8 spelling

Status: implemented

English | [中文](2026-09-07-native-constructor-source-grammar.zh.md)

## Problem

Four lossless-JSON intrinsic checks — `dsh-util-values`, `dsh-tools` JSON Schema validation, the Cordis host-runner guard, and the code-runtime worker — recognised a realm's intrinsic `Object` or `Array` constructor by comparing `Function.prototype.toString` output with the literal `function Object() { [native code] }`. That literal is V8's spelling. ECMA-262 fixes only the tokens of a NativeFunction source and leaves whitespace to the engine; JavaScriptCore and SpiderMonkey render it across three lines.

In Safari every plain object therefore failed the intrinsic test, `snapshotJsonValue` returned `undefined`, and `expandAssistantStream` threw `Assistant stream raw chunk must be a lossless JSON object` for every Assistant message carrying an embedded stream. Because that throw ran inside the Web Conversation assembly, the chat transcript froze at the first Assistant message on a live Turn and stayed blank on a cold load, while Host projections such as the Step counter kept advancing. Node, jsdom, and Chrome all run V8, so unit tests and recorded-log replays never reproduced it.

## Decision

Each of the four checks keeps its own copy — the host-runner, worker, and tools copies are deliberate realm and VM boundaries recorded by `jscpd:ignore` — and each now tests the rendered source against a regular expression built from the NativeFunction grammar: `function`, the constructor name, `()`, `{`, `[native code]`, `}`, with any whitespace between tokens. The worker copy applies the pattern through a captured intrinsic `RegExp.prototype.test`, matching how it already captures `Function.prototype.toString`. The name and prototype identity checks are unchanged, so a compiled user function renamed `Object` still fails: its source is its own body, never `[native code]`.

## Alternatives considered

**Compare against a set of known engine spellings.** Not adopted: it recreates the same failure for the next engine or the next whitespace change; the grammar is the actual contract.

**Drop the source check and rely on `constructor.name` plus prototype identity.** Not adopted: a same-realm forged constructor can satisfy both, and the existing forged-prototype tests pin that rejection.

**Centralise the four copies behind one export.** Not adopted here: the worker and host-runner copies exist so that sandboxed code cannot reach workspace runtime imports, and the tools copy guards a schema realm boundary; the duplication is recorded and intentional.

## Testing

`core/session/tests/json.spec.ts` (which exercises `dsh-util-values`), `core/tools/tests/json-schema.spec.ts`, `code-runtime-worker-thread/tests/worker-json.spec.ts`, and `cordis-host-runner/tests/sandbox.spec.ts` render the intrinsic constructors with the JavaScriptCore spelling and assert that intrinsic values still pass while forged prototypes still fail. The Safari 26 reproduction — a transcript frozen after the first Assistant reasoning row, blank on reopening — is confirmed fixed by the reporting user in Safari.

## Consequences

Plain JSON values are recognised under any conforming engine, so the Web client assembles Assistant streams in Safari and Firefox as it does in Chrome. The check remains as strict toward forged constructors as before. The [incremental assembly rebuild](2026-09-07-conversation-window-rebuild-on-assembly-failure.md) landed alongside this investigation stays useful for transient failures, but it could not recover from this one because the throw was deterministic on every window.
