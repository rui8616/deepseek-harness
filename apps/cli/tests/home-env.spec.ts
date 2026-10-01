import { homedir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { applyKasyunEnvironment, KASYUN_HOME_DIR_NAME } from '../src/home-env.ts'

describe('applyKasyunEnvironment (terminal dsh CLI)', () => {
  it('defaults an unset DSH_HOME to ~/.ks', () => {
    const env: NodeJS.ProcessEnv = {}
    applyKasyunEnvironment(env)
    expect(env.DSH_HOME).toBe(join(homedir(), '.ks'))
    expect(KASYUN_HOME_DIR_NAME).toBe('.ks')
  })

  it('treats a blank DSH_HOME as unset', () => {
    const env: NodeJS.ProcessEnv = { DSH_HOME: '  ' }
    applyKasyunEnvironment(env)
    expect(env.DSH_HOME).toBe(join(homedir(), '.ks'))
  })

  it('keeps an explicit DSH_HOME', () => {
    const env: NodeJS.ProcessEnv = { DSH_HOME: '/tmp/explicit-home' }
    applyKasyunEnvironment(env)
    expect(env.DSH_HOME).toBe('/tmp/explicit-home')
  })

  it('disables session telemetry unless the launch environment chose', () => {
    const unset: NodeJS.ProcessEnv = {}
    applyKasyunEnvironment(unset)
    expect(unset.DSH_TELEMETRY_DISABLED).toBe('1')
    const chosen: NodeJS.ProcessEnv = { DSH_TELEMETRY_DISABLED: '' }
    applyKasyunEnvironment(chosen)
    expect(chosen.DSH_TELEMETRY_DISABLED).toBe('')
  })
})
