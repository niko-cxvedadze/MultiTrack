import { defineRouting } from 'next-intl/routing'

export const locales = ['ka', 'en'] as const
export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  ka: 'KA',
  en: 'EN',
}

export const routing = defineRouting({
  locales,
  defaultLocale: 'ka',
  localePrefix: 'as-needed',
  localeDetection: false,
})
