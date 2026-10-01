import { describe, expect, it } from 'vitest'
import { NATIVE_WELCOME_ENV, nativeWelcomeEnabled } from '../src/welcome-policy.ts'

describe('nativeWelcomeEnabled (Kasyun)', () => {
  it('keeps the native welcome window closed by default', () => {
    expect(nativeWelcomeEnabled({})).toBe(false)
    expect(nativeWelcomeEnabled({ [NATIVE_WELCOME_ENV]: '' })).toBe(false)
    expect(nativeWelcomeEnabled({ [NATIVE_WELCOME_ENV]: '0' })).toBe(false)
    expect(nativeWelcomeEnabled({ [NATIVE_WELCOME_ENV]: 'true' })).toBe(false)
  })

  it('restores the upstream window only on an explicit opt-in', () => {
    expect(NATIVE_WELCOME_ENV).toBe('DSH_DESKTOP_NATIVE_WELCOME')
    expect(nativeWelcomeEnabled({ [NATIVE_WELCOME_ENV]: '1' })).toBe(true)
  })
})
