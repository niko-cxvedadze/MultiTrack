'use client'

import { useConsentStatus } from '@/data/client/consent-store'

import { ClarityAnalytics } from '@/components/layout/clarity'
import { GoogleAnalytics } from '@/components/layout/google-analytics'

export function AnalyticsWrapper() {
  const status = useConsentStatus()

  if (status !== 'accepted') return null

  return (
    <>
      <ClarityAnalytics />
      <GoogleAnalytics />
    </>
  )
}
