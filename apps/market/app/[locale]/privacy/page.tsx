import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Container } from '@/components/layout/container'
import { Separator } from '@/components/ui/separator'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'privacy' })

  return {
    title: t('title'),
    description: t('intro'),
  }
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('privacy')

  const sections = [
    'consent',
    'legalBasis',
    'dataCollection',
    'dataTypes',
    'dataUsage',
    'cookies',
    'thirdParties',
    'dataSecurity',
    'userRights',
    'userObligations',
    'childrenPrivacy',
    'dataRetention',
    'internationalTransfers',
    'directMarketing',
    'thirdPartyLinks',
    'changes',
    'contact',
  ] as const

  return (
    <Container className="py-8 sm:py-12">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t('title')}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {t('lastUpdated')}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-foreground/80">
        {t('intro')}
      </p>

      <Separator className="my-8" />

      <div className="space-y-8">
        {sections.map((section, idx) => {
          const content = t(`sections.${section}.content`)
          const paragraphs = content.split('\n\n')

          return (
            <section key={section} id={section}>
              <h2 className="text-lg font-bold tracking-tight">
                {idx + 1}. {t(`sections.${section}.title`)}
              </h2>
              <div className="mt-2 space-y-3">
                {paragraphs.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-sm leading-relaxed text-foreground/80"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </Container>
  )
}
