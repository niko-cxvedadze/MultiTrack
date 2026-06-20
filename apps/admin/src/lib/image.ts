import { getImageUrl as _getImageUrl } from '@repo/types'

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://cdn.alldrive.ge'

export const getImageUrl = (path: string | undefined) =>
  _getImageUrl(path, R2_PUBLIC_URL)

/**
 * Build a full CDN preview URL from an R2 object path.
 * Returns undefined if the path is falsy.
 */
export function getR2PreviewUrl(path: string | undefined): string | undefined {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${R2_PUBLIC_URL}/${path}`
}
