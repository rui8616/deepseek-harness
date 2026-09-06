import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { expect, it } from 'vitest'

const DIST_ROOT = fileURLToPath(new URL('../dist', import.meta.url))

it('ships install metadata with the built web application', async () => {
  const index = await readFile(join(DIST_ROOT, 'index.html'), 'utf8')
  expect(index).toContain('<link rel="manifest" href="./manifest.webmanifest" />')

  const manifest: unknown = JSON.parse(await readFile(join(DIST_ROOT, 'manifest.webmanifest'), 'utf8'))
  expect(manifest).toEqual({
    id: '/',
    name: 'KASYUN SOFT',
    short_name: 'KASYUN',
    start_url: '/',
    scope: '/',
    display: 'fullscreen',
    icons: [{
      src: '/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any',
    }],
  })
})

it('ships the Kasyun mark as a gradient favicon that needs no color-scheme swap', async () => {
  const favicon = await readFile(join(DIST_ROOT, 'favicon.svg'), 'utf8')
  // The site gradient reads on light and dark tabs alike, so the icon carries
  // no scheme-dependent fill; the mark is the same silhouette the sidebar draws.
  expect(favicon).toContain('<linearGradient id="markGrad"')
  expect(favicon).toContain('fill="url(#markGrad)" fill-rule="evenodd" d="M1.35,216.07L')
  expect(favicon).not.toContain('prefers-color-scheme')
})
