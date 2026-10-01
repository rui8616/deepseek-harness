/**
 * Kasyun product identity used by desktop packaging scripts.
 *
 * The runtime shell keeps its own copy in `src/brand.ts` because the host
 * project's rootDir is `src`; `tests/brand.spec.ts` keeps the two in step.
 */

/** Name of the application bundle, executable, menus and installer pages. */
export const PRODUCT_NAME = 'Kasyun Harness'

/** URL scheme the installed application registers for `<scheme>://open`. */
export const PROTOCOL_SCHEME = 'kasyun-harness'

/** File-name prefix of installers, archives and their update metadata. */
export const ARTIFACT_PREFIX = 'kasyun-harness'
