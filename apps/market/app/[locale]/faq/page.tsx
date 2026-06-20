import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Container } from '@/components/layout/container'
import { FaqAccordion } from '@/components/faq-accordion'

type Props = {
  params: Promise<{ locale: string }>
}

const faqCategories = [
  {
    key: 'ordering',
    items: [
      'howToOrder',
      'paymentMethods',
      'canCancelOrder',
      'orderTracking',
    ],
  },
  {
    key: 'shipping',
    items: [
      'shippingTime',
      'shippingCost',
      'deliverOutsideTbilisi',
      'pickupAvailable',
    ],
  },
  {
    key: 'products',
    items: [
      'whatIs3dPrinting',
      'productMaterials',
      'customOrders',
      'productQuality',
    ],
  },
  {
    key: 'returns',
    items: [
      'returnPolicy',
      'howToReturn',
      'refundTime',
      'damagedProduct',
    ],
  },
  {
    key: 'account',
    items: [
      'createAccount',
      'loginMethod',
      'changePersonalInfo',
    ],
  },
] as const

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('faq')

  return (
    <Container className="py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('subtitle')}
        </p>

        <div className="mt-8 space-y-8 sm:mt-10">
          {faqCategories.map((category) => (
            <section key={category.key}>
              <h2 className="mb-3 text-base font-bold tracking-tight sm:text-lg">
                {t(`categories.${category.key}`)}
              </h2>
              <FaqAccordion
                items={category.items.map((item) => ({
                  id: `${category.key}-${item}`,
                  question: t(`items.${item}.question`),
                  answer: t(`items.${item}.answer`),
                }))}
              />
            </section>
          ))}
        </div>

        <div className="mt-10 border border-border p-6 text-center sm:mt-12">
          <p className="text-sm font-medium">{t('contact.title')}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('contact.description')}
          </p>
          <p className="mt-3 text-sm font-medium text-primary">
            support@multitrack.app
          </p>
        </div>
      </div>
    </Container>
  )
}
