import { setRequestLocale, getTranslations } from 'next-intl/server'

import { routes } from '@repo/types'
import { ArrowRight } from 'lucide-react'

import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'home' })

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-16 text-center sm:py-24">
      <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
        {t('title')}
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground sm:mt-6 sm:text-lg">
        {t('subtitle')}
      </p>
      <Button size="lg" className="mt-8 gap-2" asChild>
        <Link href={routes.profile()}>
          {t('cta')}
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </Container>
  )
}
