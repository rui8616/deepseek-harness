# Agent Note: Deployment brand occupants for the sidebar slots

Status: implemented

English | [中文](2026-09-06-deployment-brand-sidebar-occupants.zh.md)

## Problem

The sidebar brand row is composed through two `single` slots, `sidebar.brand.mark` and `sidebar.brand.name`, and the only shipped occupant, `dsh-client-ui-brand-official`, registers nothing outside an `official` client build. Every other build therefore shows the shell's fallback — the fish mark, the `brand.localBuild` label, and the build stamp — with no supported way to put a deployment's own identity there short of editing `SidebarRoot.tsx` or removing the official package's build gate. The slots reference documents `single` cells as replacement points and the official README says a self-branded deployment "composes a different package into the same slots", but no such package existed to copy from, and the first attempt at one (registering unconditionally at a lower priority) would have shadowed the official brand in `official` builds as well.

## Decision

`packages/client/ui-brand-kasyun` (`@deepseek-ai/dsh-client-ui-brand-kasyun`) occupies both sidebar brand slots and the blank-session hero's `conversation.hero.brand.mark` with Kasyun Soft's brand and is mounted in the web-app bundle beside the official package. Its registration is gated as the exact complement of the official package's gate: `apply` returns early when `DSH_CLIENT_BUILD_PROFILE === 'official'`, so the two rows never register into the same cell and no priority arbitration is needed. The sidebar occupants install as one declaration-aware set (nested `ctx.slots.inject`, generator-yielded registrations) so they arrive whether the sidebar declares before or after this row and leave together on dispose; the hero occupant is a separate `ctx.slots.inject` set because the conversation entry declares that slot. The official package leaves the hero on its animated-fish fallback because that fallback already is the official mark; this package has no such reason, so the hero shows the Kasyun mark at the hero's requested size, static. The browser tab is branded outside the plugin. Its icon is the shell's static `apps/web/public/favicon.svg`, now the square-padded Kasyun mark, and `manifest.webmanifest` names the Kasyun deployment, so the PWA icon and the pre-hydration tab agree with the sidebar. Its text is the build-time `DSH_CLIENT_TITLE` the shell already honors, pinned by a new named client build profile `kasyun` in `scripts/client-build-environment.ts` (`DSH_CLIENT_BUILD_PROFILE=kasyun`, `DSH_CLIENT_TITLE=KASYUN`, repository commit and version, and the dirty marker when the tree is dirty) that the root `build` script selects by default; `build:inherited` keeps the profile-less build and `build:official` the official one.

The mark is the silhouette from `https://www.kasyunsoft.com/assets/mark.svg` — one evenodd path of five straight-edged subpaths — translated so its bounding box starts at the origin (`KASYUN_MARK_PATH`, viewBox `382.53 × 216.07`) and filled with the site's nine-stop blue-to-green gradient, defined inside the mark's own svg under a `useId`-derived id because the expanded row and the collapsed rail mount the mark at once. The name registers with a `brand` locale namespace: `brand.name` (`KASYUN` / `嘉迅` / `嘉迅`) beside a `brand.tag` badge (`HARNESS`, styled after the badge baked into the official wordmark svg — that badge is artwork inside `BrandWordmark`, not a component, which is why no non-official build showed it before), over the same build stamp the shell fallback showed — version, commit, `dirty` — from the `DSH_CLIENT_*` defines the client tsdown preset bakes into every bundle.

`apps/web/tests/built-boot.expected.e2e.ts` is the real-composition test: its non-official branch now asserts at least two Kasyun marks (sidebar and hero), the absence of every fish svg, the `KASYUN` name, the `HARNESS` badge, and the absence of the local-build label; its official branch is unchanged.

## Alternatives considered

**Register unconditionally at a lower priority than the official occupants.** Priority shadowing is documented for `single` cells and keeps the bundle additive, but it would make the custom brand win in `official` builds too, turning the official row into dead weight and breaking the e2e's official branch. Rejected in favor of the complementary gate.

**Replace the official row in the web-app bundle.** The official README's literal instruction for a self-branded deployment. Rejected because it makes the fork's bundle diverge from upstream on a shipped row and loses the ability to build an `official` client from the same roster; the complementary gate gives the same result for non-official builds without removing anything.

**Edit the shell fallback in `SidebarRoot.tsx`, or drop the official package's build gate.** Both put the brand into host source rather than a composable occupant, contradicting the slots reference's extension rules and the official package's stated replacement route.

**Name only, no build stamp.** Simpler, but a local build would lose the commit stamp the fallback carried, which is the one piece of information a test deployment needs from that row.

**The official whale in DeepSeek brand blue.** The second cut reused `FISH_LOGO_PATH` with the theme's brand-blue alias. Replaced because `BRAND_GUIDELINES.md` asks a deployment that is not DeepSeek's not to present the official mark as an endorsement, and the deployment has a mark of its own on its site.

**A generic package name (`ui-brand-custom`) with placeholder values.** The first two cuts shipped that way as a template. Renamed because the package now carries one deployment's real mark and name; a template name would misdescribe it, and another deployment composes its own package into the same slots rather than editing this one.

**A runtime favicon effect in the plugin.** An intermediate cut retargeted the shell's `link[rel="icon"]` at a `data:` svg under the plugin's build gate, so an `official` build kept the shell's icon. Replaced by the static asset because the effect left the web manifest and the pre-hydration tab on the whale, and two sources for one icon is a maintenance hazard; this repository builds no official artifacts, so the gate bought nothing.

**Rebranding the tab text through the `common` dictionary's `brand.localBuild`.** Locale-aware and needs no build flag, but the key names the shell's local-build label, `ui-sidebar`'s snapshot pins it, and a locale namespace has one owner so a plugin cannot override it. `DSH_CLIENT_TITLE` is the shell's documented title input.

**`DSH_CLIENT_TITLE` as a per-build environment variable.** Works with the profile-less build, which passes inherited `DSH_CLIENT_*` values through, but lasts only until the next build that omits it. The named profile pins the value in the repository and the default `build` script selects it, so no invocation has to remember it.

**A theme-following single color instead of the site gradient.** `currentColor` or a brand token would match the other sidebar icons, but the gradient is the identifying part of the mark; without it the silhouette reads as an anonymous angular shape.

## Consequences

Non-official builds show Kasyun's brand instead of the fish and local-build label; the e2e expectation moved with it. Changing the brand is a source edit plus a bundle rebuild, not configuration — recorded as a known limitation, as is the theme-independent gradient. The package adds a `brand` locale namespace and one more row to the web-app roster and its dependency list. Coverage is the package's own `browser-plugin.client.spec.tsx` (gate on both sides, declare-before/after, disposal, dictionaries, gradient and id uniqueness, stamp formatting) plus the assembled boot e2e for the shipped composition.
