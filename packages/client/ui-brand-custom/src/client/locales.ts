/** `brand` namespace dictionaries: the deployment's sidebar brand name. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'brand.name': 'DSH 定制版',
} satisfies Record<string, string>

/** The brand namespace key union. */
export type BrandKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'brand.name': 'DSH Custom',
} satisfies Record<BrandKey, string>

/** Japanese dictionary, checked complete against the zh key set. */
export const ja = {
  'brand.name': 'DSH カスタム',
} satisfies Record<BrandKey, string>
