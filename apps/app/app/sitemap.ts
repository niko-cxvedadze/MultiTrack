import type { MetadataRoute } from 'next'

import { locales, routing } from '@/i18n/routing'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://multitrack.app'

function localizedUrl(path: string): MetadataRoute.Sitemap[number] {
  const defaultLocale = routing.defaultLocale

  // Build alternates for each locale
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] =
      locale === defaultLocale ? `${siteUrl}${path}` : `${siteUrl}/${locale}${path}`
  }

  return {
    url: `${siteUrl}${path}`,
    alternates: { languages }
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { ...localizedUrl('/'), changeFrequency: 'daily', priority: 1.0 },
    { ...localizedUrl('/terms'), changeFrequency: 'monthly', priority: 0.3 },
    { ...localizedUrl('/privacy'), changeFrequency: 'monthly', priority: 0.3 }
  ]
}
