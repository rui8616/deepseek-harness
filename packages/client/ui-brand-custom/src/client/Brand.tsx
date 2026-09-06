import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './Brand.module.css'

/** Props of the brand-name occupant: the empty owner share plus the `brand` translate seat. */
export type CustomBrandNameProps = PropsRuntime<'sidebar.brand.name'> & PropsLocale<'brand'>

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
 * Render the deployment mark at the size the host surface requests: a filled
 * rounded square carrying a four-point spark, both following the label colors.
 * @param props - Host-supplied mark presentation.
 * @returns the decorative mark svg.
 */
export function CustomBrandMark({ size }: PropsRuntime<'sidebar.brand.mark'>) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="8" fill="currentColor" />
      <path
        d="M16 7l2.3 6.7L25 16l-6.7 2.3L16 25l-2.3-6.7L7 16l6.7-2.3z"
        fill="var(--dsw-alias-label-primary-inverted)"
      />
    </svg>
  )
}

/**
 * Render the deployment name over its build stamp.
 * @param props - The `brand` translate seat.
 * @returns the name column.
 */
export function CustomBrandName({ t }: CustomBrandNameProps) {
  const stamp = buildStamp()
  return (
    <span className={css.brand}>
      <span className={css.title}>{t('brand.name')}</span>
      {stamp !== undefined && <span className={css.stamp}>{stamp}</span>}
    </span>
  )
}
