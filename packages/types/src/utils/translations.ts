import { fromPairs, isEmpty, pickBy } from 'lodash-es'

import { DEFAULT_LOCALE, type SupportedLocale, TRANSLATION_LOCALES } from '../constants'

// ============================================================================
// TYPES
// ============================================================================

/** Shape of the `translations` JSON stored on products/categories */
export type TranslationsJson = {
  [locale in SupportedLocale]?: Record<string, string>
}

/** Key-value pair used in admin detail form lists */
export type DetailEntry = { key: string; value: string }

// ============================================================================
// FORM KEY HELPERS
// ============================================================================

/** Build form field key: `translations_en_name` */
const formKey = (locale: SupportedLocale, field: string) => `translations_${locale}_${field}`

// ============================================================================
// DETAIL ENTRIES — conversion between form arrays and stored formats
// ============================================================================

/** Convert a `Record<string, string>` to an ordered form-list array */
export function detailsToEntries(details: Record<string, string> | undefined): DetailEntry[] {
  if (!details) return []
  return Object.entries(details).map(([key, value]) => ({ key, value: String(value) }))
}

/** Convert a form-list array to a clean `Record<string, string>` (skips empty) */
export function entriesToDetails(entries: DetailEntry[] | undefined): Record<string, string> {
  const result: Record<string, string> = {}
  if (!entries) return result
  for (const e of entries) {
    if (e.key && e.value) result[e.key] = e.value
  }
  return result
}

/**
 * Parse translated details from a JSON string stored in `translations.<locale>.details`.
 * Handles both array `[{key,value}]` and legacy object `{key: value}` formats.
 * Pads result to `minLength` with empty entries so it aligns with the default-locale list.
 */
export function parseTranslatedDetailEntries(
  translations: TranslationsJson | undefined,
  locale: SupportedLocale,
  minLength: number
): DetailEntry[] {
  let entries: DetailEntry[] = []

  const json = translations?.[locale]?.details
  if (json) {
    try {
      const parsed = JSON.parse(json)
      entries = Array.isArray(parsed)
        ? (parsed as DetailEntry[])
        : detailsToEntries(parsed as Record<string, string>)
    } catch {
      // ignore
    }
  }

  while (entries.length < minLength) {
    entries.push({ key: '', value: '' })
  }
  return entries
}

/**
 * Merge translated detail entries into a translations payload.
 * Mutates `translations` in place (or creates a new object if `undefined`).
 * Returns the (possibly new) translations reference.
 */
export function mergeDetailTranslations(
  translations: TranslationsJson | undefined,
  locale: SupportedLocale,
  entries: DetailEntry[] | undefined
): TranslationsJson | undefined {
  const valid = entries?.filter((e) => e.key && e.value) ?? []
  if (valid.length === 0) return translations

  const detailsJson = JSON.stringify(valid)
  if (!translations) return { [locale]: { details: detailsJson } }

  translations[locale] = { ...translations[locale], details: detailsJson }
  return translations
}

// ============================================================================
// FIELD TRANSLATION UTILITIES
// ============================================================================

/**
 * Get a translated field value with fallback to the default locale (flat field).
 */
export function getTranslatedField<T extends Record<string, unknown>>(
  entity: T,
  field: string,
  locale: SupportedLocale
): string {
  if (locale === DEFAULT_LOCALE) {
    return (entity[field] as string) ?? ''
  }

  const translations = entity.translations as TranslationsJson | undefined

  return translations?.[locale]?.[field] || ((entity[field] as string) ?? '')
}

/**
 * Get translated product details (key-value pairs) with fallback to default locale.
 *
 * Details for the default locale are stored in the flat `details` JSON field.
 * Translated details are stored as a JSON string in `translations.<locale>.details`.
 */
export function getTranslatedDetails<T extends Record<string, unknown>>(
  entity: T,
  locale: SupportedLocale
): Record<string, string> {
  const defaultDetails = (entity.details as Record<string, string>) || {}

  if (locale === DEFAULT_LOCALE) {
    return defaultDetails
  }

  const translations = entity.translations as TranslationsJson | undefined
  const json = translations?.[locale]?.details
  if (!json) return defaultDetails

  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) {
      const result = entriesToDetails(parsed as DetailEntry[])
      return Object.keys(result).length > 0 ? result : defaultDetails
    }
    return parsed as Record<string, string>
  } catch {
    return defaultDetails
  }
}

/**
 * Build a clean translations JSON payload from form data.
 *
 * Reads `translations_<locale>_<field>` keys, trims values,
 * and returns only locales that have at least one non-empty field.
 */
export function buildTranslationsPayload(
  formValues: Record<string, unknown>,
  translatableFields: readonly string[]
): TranslationsJson | undefined {
  const entries = TRANSLATION_LOCALES.map((locale) => {
    const localeData = pickBy(
      fromPairs(
        translatableFields.map((field) => {
          const raw = formValues[formKey(locale, field)] as string | undefined
          return [field, raw?.trim() || '']
        })
      ),
      (v) => v !== ''
    ) as Record<string, string>

    return [locale, localeData] as [SupportedLocale, Record<string, string>]
  })

  const translations = fromPairs(entries.filter(([, data]) => !isEmpty(data))) as TranslationsJson

  return isEmpty(translations) ? undefined : translations
}

/**
 * Extract translation form field values from a translations JSON object.
 * Used to populate form fields on edit.
 *
 * @returns Flat object like `{ translations_en_name: 'Phone Case', translations_ru_name: 'Чехол' }`
 */
export function extractTranslationFormValues(
  translations: TranslationsJson | undefined,
  translatableFields: readonly string[]
): Record<string, string> {
  if (!translations) return {}

  return fromPairs(
    TRANSLATION_LOCALES.flatMap((locale) => {
      const localeData = translations[locale]
      if (!localeData) return []

      return translatableFields
        .filter((field) => localeData[field])
        .map((field) => [formKey(locale, field), localeData[field]])
    })
  )
}
