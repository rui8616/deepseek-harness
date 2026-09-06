/** `brand` namespace dictionaries: the deployment's sidebar brand name and its tag badge. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'brand.name': 'DSH 定制版',
  'brand.tag': 'HARNESS',
} satisfies Record<string, string>

/** The brand namespace key union. */
export type BrandKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'brand.name': 'DSH Custom',
  'brand.tag': 'HARNESS',
} satisfies Record<BrandKey, string>

/** Japanese dictionary, checked complete against the zh key set. */
export const ja = {
  'brand.name': 'DSH カスタム',
  'brand.tag': 'HARNESS',
} satisfies Record<BrandKey, string>
