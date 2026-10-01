import { describe, expect, it } from 'vitest'
import * as packaging from '../scripts/brand.mjs'
import * as shell from '../src/brand.ts'

describe('Kasyun desktop brand', () => {
  it('keeps the shell and packaging copies in step', () => {
    expect(shell.PRODUCT_NAME).toBe(packaging.PRODUCT_NAME)
    expect(shell.PROTOCOL_SCHEME).toBe(packaging.PROTOCOL_SCHEME)
  })

  it('names the product and its scheme without the upstream brand', () => {
    expect(packaging.PRODUCT_NAME).toBe('Kasyun Harness')
    expect(packaging.PROTOCOL_SCHEME).toMatch(/^[a-z][a-z0-9+.-]*$/u)
    expect(packaging.PROTOCOL_SCHEME).not.toBe('dsh')
    expect(packaging.ARTIFACT_PREFIX).not.toMatch(/deepseek/iu)
  })
})
