'use client'

import Script from 'next/script'
import { useEffect } from 'react'

import { db } from '@/data/client/db'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-SW2ME34VNC'

export function GoogleAnalytics() {
  const { user } = db.useAuth()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag || !user) return

    const userData = user as Record<string, unknown>

    window.gtag('set', 'user_properties', {
      user_id: user.id,
      email: user.email ?? undefined,
      full_name: (userData.fullName as string) ?? undefined,
      phone: (userData.phoneNumber as string) ?? undefined,
      is_guest: String(userData.isGuest ?? false),
      newsletter: String(userData.newsletterSubscribed ?? false),
    })

    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: user.id,
    })
  }, [user])

  if (!GA_MEASUREMENT_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}
