/**
 * Kasyun product identity shown by the desktop shell.
 *
 * Packaging scripts read the same values from `scripts/brand.mjs`;
 * `tests/brand.spec.ts` keeps the two copies in step.
 */

/** Name shown in menus, dialogs, the tray and the About panel. */
export const PRODUCT_NAME = 'Kasyun Harness'

/** URL scheme the installed application registers for `<scheme>://open`. */
export const PROTOCOL_SCHEME = 'kasyun-harness'
