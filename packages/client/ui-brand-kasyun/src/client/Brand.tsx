import { useId } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './Brand.module.css'
import { KASYUN_MARK_GRADIENT, KASYUN_MARK_PATH, KASYUN_MARK_VIEWBOX } from './mark.ts'

/** Props of the brand-name occupant: the empty owner share plus the `brand` translate seat. */
export type KasyunBrandNameProps = PropsRuntime<'sidebar.brand.name'> & PropsLocale<'brand'>

/**
 * Format the build stamp shown under the name: version, then commit, then a
 * `dirty` marker; absent entirely when the bundle carries no version.
 * @returns the stamp text, or undefined for a bundle built without `DSH_CLIENT_VERSION`.
 */
export function buildStamp(): string | undefined {
  const version = process.env.DSH_CLIENT_VERSION
  if (version === undefined) return undefined
  const parts = [version, process.env.DSH_CLIENT_COMMIT_HASH]
  if (process.env.DSH_CLIENT_GIT_DIRTY === 'true') parts.push('dirty')
  return parts.filter(part => part !== undefined).join('-')
}

/**
 * Render the Kasyun Soft mark at the width the host surface requests, filled
 * with the site's blue-to-green gradient; height follows the mark's own
 * ratio. The gradient id comes from `useId`, since the expanded brand row and
 * the collapsed rail mount this mark at the same time.
 * @param props - Host-supplied mark presentation.
 * @returns the decorative mark svg.
 */
export function KasyunBrandMark({ size }: PropsRuntime<'sidebar.brand.mark'>) {
  // `url(#…)` is parsed as a CSS url token; React's `:r0:` ids need the colons stripped.
  const gradientId = `kasyun-mark-${useId().replaceAll(':', '')}`
  return (
    <svg
      width={size}
      height={(size * KASYUN_MARK_VIEWBOX.height) / KASYUN_MARK_VIEWBOX.width}
      viewBox={`0 0 ${KASYUN_MARK_VIEWBOX.width} ${KASYUN_MARK_VIEWBOX.height}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          {KASYUN_MARK_GRADIENT.map(([offset, color]) => <stop key={offset} offset={offset} stopColor={color} />)}
        </linearGradient>
      </defs>
      <path d={KASYUN_MARK_PATH} fill={`url(#${gradientId})`} fillRule="evenodd" />
    </svg>
  )
}

/**
 * Render the Kasyun name with its tag badge, over the build stamp.
 * @param props - The `brand` translate seat.
 * @returns the name column.
 */
export function KasyunBrandName({ t }: KasyunBrandNameProps) {
  const stamp = buildStamp()
  return (
    <span className={css.brand}>
      <span className={css.row}>
        <span className={css.title}>{t('brand.name')}</span>
        <span className={css.badge}>{t('brand.tag')}</span>
      </span>
      {stamp !== undefined && <span className={`${css.badge} ${css.stamp}`}>{stamp}</span>}
    </span>
  )
}
