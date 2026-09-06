/** Kasyun Soft occupants for the generic sidebar and hero brand slots. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the SlotRegistry service merge (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the sidebar's slot declarations.
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
// Type-only: pulls the conversation hero's slot declaration.
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { KasyunBrandMark, KasyunBrandName, KasyunHeroMark } from './Brand.tsx'
import { installKasyunFavicon } from './favicon.ts'
import { en, ja, zh, type BrandKey } from './locales.ts'

export type { BrandKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Deployment brand copy. */
    brand: BrandKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'brand'

/** Required services: the UI slot registry and the locale dictionary registry. */
export const inject = ['slots', 'locale']

/**
 * Fill the brand slots, mirroring `dsh-client-ui-brand-official`'s build gate
 * from the other side: an `official` bundle leaves every slot to the official
 * package, every other build gets the Kasyun brand. The two sidebar slots
 * install as one declaration-aware set; the conversation hero's mark is a
 * separate set because a different entry declares it. The browser-tab icon
 * is a document effect under the same gate, outside the slot system.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  if (process.env.DSH_CLIENT_BUILD_PROFILE === 'official') return
  ctx.effect(() => ctx.locale.register(NS, { zh, en, ja }), 'ui-brand-kasyun: dictionaries')
  ctx.effect(installKasyunFavicon, 'ui-brand-kasyun: favicon')
  ctx.slots.inject('sidebar.brand.mark', () =>
    ctx.slots.inject('sidebar.brand.name', function* () {
      yield ctx.slots.register({ name: 'sidebar.brand.mark' }, KasyunBrandMark)
      yield ctx.slots.register({ name: 'sidebar.brand.name', locale: NS }, KasyunBrandName)
    }))
  ctx.slots.inject('conversation.hero.brand.mark', () =>
    ctx.slots.register({ name: 'conversation.hero.brand.mark' }, KasyunHeroMark))
}
