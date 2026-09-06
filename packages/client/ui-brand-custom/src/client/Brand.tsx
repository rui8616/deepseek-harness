import { FISH_LOGO_PATH, FISH_LOGO_VIEWBOX } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './Brand.module.css'

/** Props of the brand-name occupant: the empty owner share plus the `brand` translate seat. */
export type CustomBrandNameProps = PropsRuntime<'sidebar.brand.name'> & PropsLocale<'brand'>

/** Theme alias of the DeepSeek brand blue (light and dark values live in ui-theme). */
const BRAND_BLUE = 'var(--dsw-alias-brand-primary-new-colorprimary-new-color)'

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
 * Render the deployment mark at the width the host surface requests: the
 * official whale silhouette (the geometry `dsh-client-ui-primitives` exports
 * for composed marks) filled with the theme's DeepSeek brand blue, where the
 * shell fallback draws the same silhouette in ink. Height follows the
 * silhouette's own ratio.
 * @param props - Host-supplied mark presentation.
 * @returns the decorative mark svg.
 */
export function CustomBrandMark({ size }: PropsRuntime<'sidebar.brand.mark'>) {
  return (
    <svg
      width={size}
      height={(size * FISH_LOGO_VIEWBOX.height) / FISH_LOGO_VIEWBOX.width}
      viewBox={`0 0 ${FISH_LOGO_VIEWBOX.width} ${FISH_LOGO_VIEWBOX.height}`}
      fill="none"
      aria-hidden="true"
    >
      <path d={FISH_LOGO_PATH} fill={BRAND_BLUE} />
    </svg>
  )
}

/**
 * Render the deployment name with its tag badge, over the build stamp.
 * @param props - The `brand` translate seat.
 * @returns the name column.
 */
export function CustomBrandName({ t }: CustomBrandNameProps) {
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
