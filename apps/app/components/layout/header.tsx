import { useTranslations } from 'next-intl'

import { Container } from '@/components/layout/container'
import { HeaderActions } from '@/components/layout/header-actions'
import { LanguageSwitcher } from '@/components/layout/language-switcher'
import { ThemeToggle } from '@/components/layout/theme-toggle'

import { Link } from '@/i18n/navigation'

export function Header() {
  const t = useTranslations('header')

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar — always black */}
      <div className="bg-header-topbar-bg">
        <Container className="flex h-8 items-center justify-between sm:h-9">
          <p className="text-xs text-header-topbar-fg/70 sm:text-sm">{t('announcement')}</p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </Container>
      </div>

      {/* Main header */}
      <div className="bg-primary">
        <Container className="flex items-center gap-4 py-3 sm:gap-6 sm:py-4">
          <Link href="/" className="shrink-0">
            <span className="text-xl font-black tracking-tight text-primary-foreground sm:text-2xl">
              MultiTrack
            </span>
          </Link>

          <div className="flex-1" />

          <HeaderActions />
        </Container>
      </div>
    </header>
  )
}
