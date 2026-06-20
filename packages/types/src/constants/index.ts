/**
 * Centralized constants for the application.
 *
 * IMPORTANT: Always use these constants instead of hardcoding values.
 * Use `createLabelMap` + `LabelValuePair` to build value→label lookups.
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface LabelValuePair<T extends string = string> {
  value: T
  labelKey: string
}

/**
 * Helper to create a lookup map from an array of LabelValuePairs
 */
export function createLabelMap<T extends readonly LabelValuePair[]>(
  items: T
): Record<T[number]['value'], string> {
  return Object.fromEntries(items.map(({ value, labelKey }) => [value, labelKey])) as Record<
    T[number]['value'],
    string
  >
}

// ============================================================================
// PAGINATION
// ============================================================================

export const DEFAULT_PAGE_SIZE = 20

// ============================================================================
// OTP PURPOSE
// ============================================================================

export enum OtpPurpose {
  Login = 'login',
  Register = 'register'
}

// ============================================================================
// UPLOADS — allowed content types
// ============================================================================

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
] as const

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

export const MAX_IMAGE_SIZE_MB = 5

export const BLOCKED_IMAGE_TYPES = [
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence'
] as const

/** File extensions that should be rejected even when MIME type is empty */
export const BLOCKED_IMAGE_EXTENSIONS = ['.heic', '.heif'] as const

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'] as const

export type AllowedVideoType = (typeof ALLOWED_VIDEO_TYPES)[number]

export const MAX_VIDEO_SIZE_MB = 100

/** Fallback MIME type when the browser cannot determine the file type */
export const FALLBACK_CONTENT_TYPE = 'application/octet-stream'

export const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  [FALLBACK_CONTENT_TYPE]: '.bin'
}

export const DEFAULT_FILE_EXTENSION = '.bin'

export function getFileExtension(contentType: string): string {
  return CONTENT_TYPE_EXTENSIONS[contentType] || DEFAULT_FILE_EXTENSION
}

// ============================================================================
// LOCALES
// ============================================================================

export enum SupportedLocale {
  Ka = 'ka',
  En = 'en'
}

export const DEFAULT_LOCALE = SupportedLocale.Ka

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  SupportedLocale.Ka,
  SupportedLocale.En
] as const

/** Non-default locales (the ones stored in `translations` JSON) */
export const TRANSLATION_LOCALES: readonly SupportedLocale[] = SUPPORTED_LOCALES.filter(
  (l) => l !== DEFAULT_LOCALE
)

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  [SupportedLocale.Ka]: 'ქართული',
  [SupportedLocale.En]: 'English'
}

// ============================================================================
// CACHE CONTROL
// ============================================================================

export const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable'

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/** Slug pattern: lowercase alphanumeric segments separated by hyphens */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const MOBILE_BREAKPOINT = 640
