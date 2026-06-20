import { kebabCase } from 'lodash-es'

/**
 * Build a full CDN URL from an R2 object path.
 * Full URLs (legacy data starting with http) are returned as-is.
 */
export function getImageUrl(
  path: string | undefined,
  baseUrl: string,
): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${baseUrl}/${path}`
}

const LUCIDE_CDN = 'https://cdn.jsdelivr.net/npm/lucide-static@latest/icons'

/**
 * Build a CDN URL for a Lucide icon SVG by its PascalCase name (as stored in DB).
 * @example getLucideIconUrl('ShoppingCart') // 'https://cdn.jsdelivr.net/.../shopping-cart.svg'
 */
export function getLucideIconUrl(name: string): string {
  return `${LUCIDE_CDN}/${kebabCase(name)}.svg`
}
