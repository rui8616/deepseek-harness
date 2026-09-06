---
description: "Kasyun Soft brand occupants for the sidebar, active in every non-official build; for maintainers of this deployment's mark and name."
kind: "package-reference"
---

# @deepseek-ai/dsh-client-ui-brand-kasyun

English | [中文](README.zh.md)

## Summary

This package fills the brand slots — `sidebar.brand.mark`, `sidebar.brand.name`, and the blank-session hero's `conversation.hero.brand.mark` — with the Kasyun Soft mark and name. It registers these occupants in every client bundle except one built with the `official` profile, the exact complement of [`dsh-client-ui-brand-official`](../ui-brand-official/README.md): the two packages share a bundle roster without ever occupying the same cell, so an `official` build shows the official brand and every other build shows Kasyun's. The mark is the silhouette from the company site, filled with the site's blue-to-green gradient; the name sits beside a `HARNESS` badge and over the shell's build stamp (version, commit, dirty marker), so a local build loses no information the fallback carried. The hero mark is the same silhouette at the hero's size, without the fallback fish's hover animation. It retains no runtime state and contributes nothing to model requests.

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

### Changing the brand

The mark's geometry and gradient live in [`src/client/mark.ts`](src/client/mark.ts): the path is `https://www.kasyunsoft.com/assets/mark.svg` translated to the origin, the gradient its nine stops. [`src/client/Brand.tsx`](src/client/Brand.tsx) draws them at the width the host surface requests. The name is the `brand.name` key in [`src/client/locales.ts`](src/client/locales.ts) and the badge beside it is `brand.tag`, one entry each per shipped locale (zh, en, ja); `verify-client-ui-i18n` rejects product copy written directly into the component. Rebuild the bundle (`pnpm --filter @deepseek-ai/dsh-client-ui-brand-kasyun bundle`) before probing a live `dsh web` server.

### Choosing the profile

`DSH_CLIENT_BUILD_PROFILE` selects which brand renders. An `official` build leaves both slots to the official package; any other value (including unset) registers this package's occupants. The plugin loads and validates in both cases; only the registration is profile-gated.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

<details>
<summary>Implementation internals — click to expand</summary>

The two sidebar occupants install as one declaration-aware registration set: nested `ctx.slots.inject()` calls wait on the sidebar declaration, so the set works whether this row activates before or after the declarer, withdraws both occupants when the declaration collapses, and leaves no partial brand mix during HMR. The hero occupant is its own `ctx.slots.inject()` set because the conversation entry, not the sidebar, declares that slot. The mark's gradient is defined inside its own svg under a `useId`-derived id, because the expanded brand row, the collapsed rail, and the hero can mount the mark at the same time and a fixed id would collide. The name occupant registers with the `brand` locale namespace, whose dictionaries the plugin registers through `ctx.locale` in the same apply; the build stamp reads the `DSH_CLIENT_*` defines every client bundle carries. The browser half is [`src/client/index.ts`](src/client/index.ts); the node half is an empty Loader seat.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

Read these pages when the brand surface is not enough. They move from the slots this package occupies to the shell that renders them.

- [ui-brand-official](../ui-brand-official/README.md) — the complementary occupant set for `official` builds.
- [ui-sidebar](../ui-sidebar/README.md) — declares `sidebar.brand.mark` and `sidebar.brand.name` and renders their fallbacks.
- [ui-conversation](../ui-conversation/README.md) — declares `conversation.hero.brand.mark` in the blank-session hero.
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
- **The gradient is fixed** — the mark keeps the site's colors in both themes rather than following the theme's label or brand tokens.
- **The browser title is independent** — `DSH_CLIENT_TITLE` selects title text at build time rather than through a UI slot.

<a id="dev-note"></a>
### Dev Note

<details>
<summary>Working context for maintainers — click to expand</summary>

None.

</details>

**Runtime invariant:** No companion is published. The package retains no mutable state, and its slot occupants install and leave through their declaration-aware effects.
