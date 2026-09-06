---
description: "Deployment-owned brand occupants for the sidebar, active in every non-official build; for maintainers replacing the local-build brand with their own mark and name."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-custom

English | [中文](README.zh.md)

## Summary

This package fills the sidebar brand slots — `sidebar.brand.mark` and `sidebar.brand.name` — with a deployment-owned mark and name. It registers these occupants in every client bundle except one built with the `official` profile, the exact complement of [`dsh-client-ui-brand-official`](../ui-brand-official/README.md): the two packages share a bundle roster without ever occupying the same cell, so an `official` build shows the official brand and every other build shows this one. The name keeps the shell's build stamp (version, commit, dirty marker) under it, so a local build loses no information the fallback carried. The conversation hero slot (`conversation.hero.brand.mark`) stays unoccupied: its declaring package renders the animated hero fish as the fallback. Choose this package when the deployed identity is not DeepSeek's own; edit `src/client/Brand.tsx` and `src/client/locales.ts` to make the mark and name yours. It retains no runtime state and contributes nothing to model requests.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Mount this plugin in the browser roster of the web-app bundle (the shipped roster already carries it beside the official package) and build the client with any profile other than `official`.

### Making the brand yours

The mark is the `CustomBrandMark` svg in [`src/client/Brand.tsx`](src/client/Brand.tsx); it receives the `size` the host surface requests and draws with `currentColor` and the inverted label token so it follows the theme. The name is the `brand.name` key in [`src/client/locales.ts`](src/client/locales.ts), one entry per shipped locale (zh, en, ja); `verify-client-ui-i18n` rejects product copy written directly into the component. Rebuild the bundle (`pnpm --filter @deepseek-ai/dsh-client-ui-brand-custom bundle`) before probing a live `dsh web` server.

### Choosing the profile

`DSH_CLIENT_BUILD_PROFILE` selects which brand renders. An `official` build leaves both slots to the official package; any other value (including unset) registers this package's occupants. The plugin loads and validates in both cases; only the registration is profile-gated.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The two occupants install as one declaration-aware registration set: nested `ctx.slots.inject()` calls wait on the sidebar declaration, so the set works whether this row activates before or after the declarer, withdraws both occupants when the declaration collapses, and leaves no partial brand mix during HMR. The name occupant registers with the `brand` locale namespace, whose dictionaries the plugin registers through `ctx.locale` in the same apply; the build stamp reads the `DSH_CLIENT_*` defines every client bundle carries. The browser half is [`src/client/index.ts`](src/client/index.ts); the node half is an empty Loader seat.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages when the brand surface is not enough. They move from the slots this package occupies to the shell that renders them.

- [ui-brand-official](../ui-brand-official/README.md) — the complementary occupant set for `official` builds.
- [ui-sidebar](../ui-sidebar/README.md) — declares `sidebar.brand.mark` and `sidebar.brand.name` and renders their fallbacks.
- [Web Client Slots](../../../docs/subsystems/slots.md) — the composition rules this package follows.

-----

<a id="model-experience"></a>
## Model Experience

None, as the package contributes browser presentation only; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>


These limits define how brand presentation is supplied. They are current package constraints, not a brand-design comparison or a task backlog.

- **Brand content is source, not configuration** — changing the mark or name means editing this package and rebuilding its bundle; no cordis.yml field or settings card selects them.
- **The browser title is independent** — `DSH_CLIENT_TITLE` selects title text at build time rather than through a UI slot.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. The package retains no mutable state, and its two slot occupants install and leave through one transactional effect.
