import { kebabCase } from 'lodash-es'

import { getFileExtension } from '../constants'

interface BuildR2KeyOptions {
  folder: string
  contentType: string
  fileName?: string
}

/**
 * Extracts the extension from a filename (e.g. "model.3mf" → ".3mf").
 * Returns undefined if no extension is found.
 */
export function extractFileExtension(fileName: string): string | undefined {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex <= 0) return undefined
  return fileName.substring(dotIndex).toLowerCase()
}

/**
 * Extracts the base name (without extension) from a filename
 * and converts it to a URL-safe kebab-case slug.
 * Returns undefined if the result is empty (e.g. non-Latin characters only).
 */
export function sanitizeFileName(fileName: string): string | undefined {
  const dotIndex = fileName.lastIndexOf('.')
  const raw = dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName
  const slug = kebabCase(raw)
  return slug || undefined
}

/**
 * Builds an R2 object key for file uploads.
 *
 * When `fileName` is provided, the key preserves a sanitized version of the
 * original name and its extension: `folder/my-model_a1b2c3d4.3mf`
 *
 * When no `fileName` is provided (e.g. images), the key uses a full UUID hash
 * with the extension derived from `contentType`: `folder/a1b2c3d4e5f6.webp`
 */
export function buildR2Key({ folder, contentType, fileName }: BuildR2KeyOptions): string {
  if (fileName) {
    const ext = extractFileExtension(fileName) ?? getFileExtension(contentType)
    const baseName = sanitizeFileName(fileName) ?? 'file'
    const hash = crypto.randomUUID().replace(/-/g, '').slice(0, 8)
    return `${folder}/${baseName}_${hash}${ext}`
  }

  const ext = getFileExtension(contentType)
  const hash = crypto.randomUUID().replace(/-/g, '')
  return `${folder}/${hash}${ext}`
}

/**
 * Returns true if the URL is an R2 storage path (not an external HTTP URL).
 * Use this to decide whether to delete a file from R2 storage.
 */
export function isR2StoragePath(url: string | null | undefined): url is string {
  return !!url && !url.startsWith('http')
}
