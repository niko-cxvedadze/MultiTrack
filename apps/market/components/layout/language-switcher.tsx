'use client'

import { useLocale } from 'next-intl'

import { usePathname, useRouter } from '@/i18n/navigation'
import { type Locale, localeNames, locales } from '@/i18n/routing'

const localeFlags: Record<Locale, string> = {
  ka: '🇬🇪',
  en: '🇬🇧',
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className="flex items-center gap-2">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`flex items-center gap-1 text-xs font-medium transition-colors ${
            l === locale
              ? 'text-header-topbar-fg'
              : 'text-header-topbar-fg/40 hover:text-header-topbar-fg/70'
          }`}
        >
          <span>{localeFlags[l]}</span>
          {localeNames[l]}
        </button>
      ))}
    </div>
  )
}
