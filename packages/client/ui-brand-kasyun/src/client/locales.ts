/** `brand` namespace dictionaries: the Kasyun Soft sidebar brand name and its tag badge. */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'brand.name': '嘉迅AI AGENT',
  'brand.tag': 'HARNESS',
} satisfies Record<string, string>

/** The brand namespace key union. */
export type BrandKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'brand.name': 'KASYUN AI AGENT',
  'brand.tag': 'HARNESS',
} satisfies Record<BrandKey, string>

/** Japanese dictionary, checked complete against the zh key set. */
export const ja = {
  'brand.name': '嘉迅AIエージェント',
  'brand.tag': 'HARNESS',
} satisfies Record<BrandKey, string>
