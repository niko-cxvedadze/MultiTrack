import { useTranslations } from 'next-intl'

import { Container } from '@/components/layout/container'
import { Link } from '@/i18n/navigation'

const linkHrefMap: Record<string, string> = {
  faq: '/faq',
  termsAndConditions: '/terms',
  privacyPolicy: '/privacy',
}

const mainLinks = ['about', 'faq'] as const
const legalLinks = ['termsAndConditions', 'privacyPolicy'] as const
const socialLinks = ['instagram', 'facebook', 'tiktok'] as const

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="mt-8 border-t border-border bg-muted sm:mt-12">
      <Container className="py-8 sm:py-10">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Main links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {mainLinks.map((link) => (
              <Link
                key={link}
                href={linkHrefMap[link] || '/'}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(`links.${link}`)}
              </Link>
            ))}
          </nav>

          {/* Legal & social links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {legalLinks.map((link) => (
              <Link
                key={link}
                href={linkHrefMap[link] || '/'}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(`links.${link}`)}
              </Link>
            ))}
            {socialLinks.map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(`links.${social}`)}
              </a>
            ))}
          </nav>

        </div>
      </Container>
    </footer>
  )
}
