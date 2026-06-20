import { useTranslations } from 'next-intl'

import { NotFoundContent } from '@/components/layout/not-found-content'

export default function NotFoundPage() {
  const t = useTranslations('notFound')

  return (
    <NotFoundContent
      title={t('title')}
      description={t('description')}
      backLabel={t('backHome')}
      backHref="/"
    />
  )
}
