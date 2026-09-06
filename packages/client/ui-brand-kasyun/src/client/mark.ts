/**
 * The Kasyun Soft mark: the single evenodd silhouette from
 * `https://www.kasyunsoft.com/assets/mark.svg`, translated so its bounding
 * box starts at the origin and otherwise kept at the site's own units.
 */

/** Native viewBox of {@link KASYUN_MARK_PATH} (width and height in user units). */
export const KASYUN_MARK_VIEWBOX = { width: 382.53, height: 216.07 }

/** The mark's path data: five straight-edged subpaths, filled with the evenodd rule. */
export const KASYUN_MARK_PATH = 'M1.35,216.07L0.00,215.25L43.54,166.36L105.43,0.01L138.11,0.07L73.64,175.07Z M82.65,170.59L94.26,138.36L107.60,130.38L116.93,125.12L185.06,87.42L202.08,103.66Z M297.94,167.37L274.10,166.72L131.23,30.36L142.69,0.10L146.96,0.37L320.61,167.38Z M322.59,163.30L299.32,140.08L301.07,134.14L308.60,113.87L339.18,31.77L381.57,4.56Z M240.04,83.11L222.57,66.73L223.65,65.92L341.75,0.00L382.53,0.14L337.09,29.22L240.64,83.11Z'

/** The site's left-to-right fill gradient, as `[offset, color]` stops across the mark's width. */
export const KASYUN_MARK_GRADIENT: ReadonlyArray<readonly [number, string]> = [
  [0, '#3363AD'],
  [0.125, '#3565AE'],
  [0.25, '#3465AE'],
  [0.375, '#3171A7'],
  [0.5, '#307C9D'],
  [0.625, '#308B88'],
  [0.75, '#329674'],
  [0.875, '#35A05C'],
  [1, '#36A257'],
]
