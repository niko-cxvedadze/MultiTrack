'use client'

import { useEffect } from 'react'

import { db } from '@/data/client/db'

declare global {
  interface Window {
    $crisp: unknown[]
    CRISP_WEBSITE_ID: string
  }
}

const CRISP_WEBSITE_ID =
  process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || 'bf216472-d33b-4430-93e4-304ccf87806a'

export function CrispChat() {
  const { user } = db.useAuth()

  useEffect(() => {
    if (!CRISP_WEBSITE_ID) return

    window.$crisp = []
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID
    ;(() => {
      const d = document
      const s = d.createElement('script')
      s.src = 'https://client.crisp.chat/l.js'
      s.async = true
      d.getElementsByTagName('head')[0].appendChild(s)
    })()
  }, [])

  useEffect(() => {
    if (!window.$crisp || !user) return

    const userData = user as Record<string, unknown>

    if (user.email) {
      window.$crisp.push(['set', 'user:email', [user.email]])
    }

    if (userData.fullName) {
      window.$crisp.push(['set', 'user:nickname', [userData.fullName as string]])
    }

    if (userData.phoneNumber) {
      window.$crisp.push(['set', 'user:phone', [userData.phoneNumber as string]])
    }

    window.$crisp.push([
      'set',
      'session:data',
      [
        [
          ['user_id', user.id],
          ['created_at', userData.created_at as string],
          ['is_guest', String(userData.isGuest ?? false)],
          ['newsletter', String(userData.newsletterSubscribed ?? false)]
        ]
      ]
    ])
  }, [user])

  return null
}
