/** Kasyun Soft occupants for the generic sidebar brand slots. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the SlotRegistry service merge (ctx.slots).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only: pulls the sidebar's slot declarations.
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { KasyunBrandMark, KasyunBrandName } from './Brand.tsx'
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
 * Fill the sidebar brand slots as one declaration-aware registration set,
 * mirroring `dsh-client-ui-brand-official`'s build gate from the other side:
 * an `official` bundle leaves both slots to the official package, every other
 * build gets the Kasyun brand. The conversation hero stays on its declaring
 * package's animated fish fallback.
 * @param ctx - Client root context.
 */
export function apply(ctx: ClientContext): void {
  if (process.env.DSH_CLIENT_BUILD_PROFILE === 'official') return
  ctx.effect(() => ctx.locale.register(NS, { zh, en, ja }), 'ui-brand-kasyun: dictionaries')
  ctx.slots.inject('sidebar.brand.mark', () =>
    ctx.slots.inject('sidebar.brand.name', function* () {
      yield ctx.slots.register({ name: 'sidebar.brand.mark' }, KasyunBrandMark)
      yield ctx.slots.register({ name: 'sidebar.brand.name', locale: NS }, KasyunBrandName)
    }))
}
