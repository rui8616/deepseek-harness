/**
 * Browser-tab icon: the Kasyun mark padded to a square, installed over the
 * shell's `link[rel="icon"]` for the plugin's lifetime and retracted on
 * dispose so the shell's own icon returns.
 */
import { KASYUN_MARK_GRADIENT, KASYUN_MARK_PATH, KASYUN_MARK_VIEWBOX } from './mark.ts'

/** MIME type of the installed icon and of the shell's own svg icon. */
const SVG_TYPE = 'image/svg+xml'

/**
 * The mark as a standalone svg document centered in a square viewBox, as a
 * `data:` URL the tab can load without a route.
 * @returns the icon URL.
 */
export function kasyunFaviconUrl(): string {
  const { width, height } = KASYUN_MARK_VIEWBOX
  const top = ((width - height) / 2).toFixed(2)
  const stops = KASYUN_MARK_GRADIENT
    .map(([offset, color]) => `<stop offset="${String(offset)}" stop-color="${color}"/>`)
    .join('')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -${top} ${String(width)} ${String(width)}">`
    + `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0">${stops}</linearGradient></defs>`
    + `<path d="${KASYUN_MARK_PATH}" fill="url(#g)" fill-rule="evenodd"/></svg>`
  return `data:${SVG_TYPE},${encodeURIComponent(svg)}`
}

/**
 * Point the document's icon link at the Kasyun mark. An existing
 * `link[rel="icon"]` is retargeted and its previous `href`/`type` restored on
 * dispose; without one, a link is appended and removed on dispose.
 * @returns the disposer restoring the shell's icon.
 */
export function installKasyunFavicon(): () => void {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]')
  const link = existing ?? document.createElement('link')
  const previous = existing === null ? undefined : { href: link.href, type: link.type }
  link.rel = 'icon'
  link.type = SVG_TYPE
  link.href = kasyunFaviconUrl()
  if (existing === null) document.head.append(link)
  return () => {
    if (previous === undefined) {
      link.remove()
      return
    }
    link.href = previous.href
    link.type = previous.type
  }
}
