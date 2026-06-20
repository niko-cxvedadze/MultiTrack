import { useEffect } from 'react'

import { Card, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import { usePageHeader } from '@/hooks'

export function Dashboard() {
  const { t } = useTranslation()
  const { setHeader } = usePageHeader()

  useEffect(() => {
    setHeader(t('dashboard.title'))
  }, [t, setHeader])

  return (
    <Card>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        {t('dashboard.welcomeTitle')}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        {t('dashboard.welcomeSubtitle')}
      </Typography.Paragraph>
    </Card>
  )
}
