// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { SlotRegistry } from '@deepseek-ai/dsh-client-ui-renderer/client'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { apply, inject } from '../src/client/index.ts'
import { buildStamp, KasyunBrandMark, KasyunBrandName, type KasyunBrandNameProps } from '../src/client/Brand.tsx'
import { en, ja, zh } from '../src/client/locales.ts'
import { KASYUN_MARK_GRADIENT, KASYUN_MARK_VIEWBOX } from '../src/client/mark.ts'
import { apply as hostApply } from '../src/index.ts'

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
})

const HOLES = [
  'sidebar.brand.mark',
  'sidebar.brand.name',
] as const

const HERO_HOLE = 'conversation.hero.brand.mark'

/** The name occupant reads only its translate seat; the standard hooks stay unexercised here. */
function nameProps(t: (key: string) => string): KasyunBrandNameProps {
  return { t } as unknown as KasyunBrandNameProps
}

/** The mark occupant reads only the requested size; the standard hooks stay unexercised here. */
function markProps(size: number): PropsRuntime<'sidebar.brand.mark'> {
  return { size } as unknown as PropsRuntime<'sidebar.brand.mark'>
}

async function bench(declare = true) {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const locale = new LocaleRuntime(ctx)
  ctx.provide('locale', locale)
  const slots = ctx.get('slots') as SlotRegistry
  const declareHoles = () => slots.register({
    name: 'root',
    children: Object.fromEntries([...HOLES, HERO_HOLE].map(name => [name, { kind: 'single', scope: 'root' }])),
  } as never, () => null)
  const disposeHoles = declare ? declareHoles() : undefined
  return { ctx, slots, locale, declareHoles, disposeHoles }
}

describe('Kasyun browser-brand plugin', () => {
  it('keeps the host Loader entry inert', () => {
    expect(hostApply).not.toThrow()
  })

  it('declares only the services it uses', () => {
    expect(inject).toEqual(['slots', 'locale'])
  })

  it('leaves every slot empty in the official build profile', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'official')
    const subject = await bench()
    await subject.ctx.plugin({ inject: [...inject], apply }).await()
    for (const hole of HOLES) expect(subject.slots.entries(hole)).toHaveLength(0)
  })

  it('fills declarations before or after apply and removes every occupant on teardown', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    const before = await bench()
    const fiber = before.ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    before.disposeHoles?.()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)
    before.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(1)

    await fiber.dispose()
    for (const hole of HOLES) expect(before.slots.entries(hole)).toHaveLength(0)

    const after = await bench(false)
    await after.ctx.plugin({ inject: [...inject], apply }).await()
    for (const hole of HOLES) expect(after.slots.entries(hole)).toHaveLength(0)
    after.declareHoles()
    await Promise.resolve()
    for (const hole of HOLES) expect(after.slots.entries(hole)).toHaveLength(1)
  })

  it('registers the brand dictionaries for the shipped locales and leaves the hero alone', async () => {
    vi.stubEnv('DSH_CLIENT_BUILD_PROFILE', 'local')
    const subject = await bench()
    await subject.ctx.plugin({ inject: [...inject], apply }).await()
    expect(subject.slots.entries(HERO_HOLE)).toHaveLength(0)
    const t = subject.locale.bind('brand')
    subject.locale.setLocale('zh')
    expect(t('brand.name')).toBe(zh['brand.name'])
    subject.locale.setLocale('en')
    expect(t('brand.name')).toBe(en['brand.name'])
    subject.locale.setLocale('ja')
    expect(t('brand.name')).toBe(ja['brand.name'])
  })

  it('renders the site mark with its gradient at every requested width', () => {
    const mark = render(<KasyunBrandMark {...markProps(34)} />)
    const svg = mark.container.querySelector('svg')
    expect(svg?.getAttribute('viewBox')).toBe(`0 0 ${KASYUN_MARK_VIEWBOX.width} ${KASYUN_MARK_VIEWBOX.height}`)
    expect(svg?.getAttribute('width')).toBe('34')
    expect(Number(svg?.getAttribute('height'))).toBeCloseTo((34 * KASYUN_MARK_VIEWBOX.height) / KASYUN_MARK_VIEWBOX.width)
    const gradient = svg?.querySelector('linearGradient')
    expect(gradient?.querySelectorAll('stop')).toHaveLength(KASYUN_MARK_GRADIENT.length)
    const path = svg?.querySelector('path')
    expect(path?.getAttribute('fill')).toBe(`url(#${gradient?.id})`)
    expect(path?.getAttribute('fill-rule')).toBe('evenodd')
    mark.rerender(<KasyunBrandMark {...markProps(24)} />)
    expect(mark.container.querySelector('svg')?.getAttribute('width')).toBe('24')
  })

  it('gives each mounted mark its own gradient id', () => {
    const both = render(<><KasyunBrandMark {...markProps(24)} /><KasyunBrandMark {...markProps(24)} /></>)
    const ids = [...both.container.querySelectorAll('linearGradient')].map(node => node.id)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    for (const id of ids) expect(id).toMatch(/^kasyun-mark-[^:]+$/)
  })

  it('renders the name, its tag badge, and the build stamp the bundle carries', () => {
    vi.stubEnv('DSH_CLIENT_VERSION', '1.2.3')
    vi.stubEnv('DSH_CLIENT_COMMIT_HASH', 'abc1234')
    vi.stubEnv('DSH_CLIENT_GIT_DIRTY', 'true')
    const t = (key: string) => `[${key}]`
    const name = render(<KasyunBrandName {...nameProps(t)} />)
    expect(name.getByText('[brand.name]')).toBeTruthy()
    expect(name.getByText('[brand.tag]')).toBeTruthy()
    expect(name.getByText('1.2.3-abc1234-dirty')).toBeTruthy()
  })

  it('omits the stamp when the bundle carries no version, and the commit when absent', () => {
    vi.stubEnv('DSH_CLIENT_VERSION', undefined)
    expect(buildStamp()).toBeUndefined()
    const t = (key: string) => key
    const name = render(<KasyunBrandName {...nameProps(t)} />)
    expect(name.container.textContent).toBe('brand.namebrand.tag')

    vi.stubEnv('DSH_CLIENT_VERSION', '1.2.3')
    vi.stubEnv('DSH_CLIENT_COMMIT_HASH', undefined)
    vi.stubEnv('DSH_CLIENT_GIT_DIRTY', undefined)
    expect(buildStamp()).toBe('1.2.3')
  })
})
