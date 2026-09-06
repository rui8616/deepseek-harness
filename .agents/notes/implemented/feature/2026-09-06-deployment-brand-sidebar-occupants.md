# Agent Note: Deployment brand occupants for the sidebar slots

Status: implemented

English | [中文](2026-09-06-deployment-brand-sidebar-occupants.zh.md)

## Problem

The sidebar brand row is composed through two `single` slots, `sidebar.brand.mark` and `sidebar.brand.name`, and the only shipped occupant, `dsh-client-ui-brand-official`, registers nothing outside an `official` client build. Every other build therefore shows the shell's fallback — the fish mark, the `brand.localBuild` label, and the build stamp — with no supported way to put a deployment's own identity there short of editing `SidebarRoot.tsx` or removing the official package's build gate. The slots reference documents `single` cells as replacement points and the official README says a self-branded deployment "composes a different package into the same slots", but no such package existed to copy from, and the first attempt at one (registering unconditionally at a lower priority) would have shadowed the official brand in `official` builds as well.

## Decision

`packages/client/ui-brand-custom` (`@deepseek-ai/dsh-client-ui-brand-custom`) occupies both sidebar brand slots and is mounted in the web-app bundle beside the official package. Its registration is gated as the exact complement of the official package's gate: `apply` returns early when `DSH_CLIENT_BUILD_PROFILE === 'official'`, so the two rows never register into the same cell and no priority arbitration is needed. The occupants install as one declaration-aware set (nested `ctx.slots.inject`, generator-yielded registrations) so they arrive whether the sidebar declares before or after this row and leave together on dispose.

The mark is an inline svg (`viewBox="0 0 32 32"`, rounded square plus spark) drawn with `currentColor` and `--dsw-alias-label-primary-inverted`. The name registers with a `brand` locale namespace (`brand.name` in zh, en, ja) and renders the same build stamp the shell fallback showed — version, commit, `dirty` — from the `DSH_CLIENT_*` defines the client tsdown preset bakes into every bundle, so a local build keeps its commit stamp in the sidebar. Placeholder brand values ship (`DSH Custom` and its zh/ja counterparts); a deployment edits `Brand.tsx` and `locales.ts`.

`apps/web/tests/built-boot.expected.e2e.ts` is the real-composition test: its non-official branch now asserts the custom mark and name and the absence of the local-build label; its official branch is unchanged.

## Alternatives considered

**Register unconditionally at a lower priority than the official occupants.** Priority shadowing is documented for `single` cells and keeps the bundle additive, but it would make the custom brand win in `official` builds too, turning the official row into dead weight and breaking the e2e's official branch. Rejected in favor of the complementary gate.

**Replace the official row in the web-app bundle.** The official README's literal instruction for a self-branded deployment. Rejected because it makes the fork's bundle diverge from upstream on a shipped row and loses the ability to build an `official` client from the same roster; the complementary gate gives the same result for non-official builds without removing anything.

**Edit the shell fallback in `SidebarRoot.tsx`, or drop the official package's build gate.** Both put the brand into host source rather than a composable occupant, contradicting the slots reference's extension rules and the official package's stated replacement route.

**Name only, no build stamp.** Simpler, but a local build would lose the commit stamp the fallback carried, which is the one piece of information a test deployment needs from that row.

## Consequences

Non-official builds show the custom brand instead of the fish and local-build label; the e2e expectation moved with it. Changing the brand is a source edit plus a bundle rebuild, not configuration — recorded as a known limitation. The package adds a `brand` locale namespace and one more row to the web-app roster and its dependency list. Coverage is the package's own `browser-plugin.client.spec.tsx` (gate on both sides, declare-before/after, disposal, dictionaries, stamp formatting) plus the assembled boot e2e for the shipped composition.
