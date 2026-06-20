'use client'

import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'

import { db } from '@/data/client/db'

const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'w2fgwvw19c'

export function ClarityAnalytics() {
  const { user } = db.useAuth()

  useEffect(() => {
    if (!CLARITY_PROJECT_ID) return
    Clarity.init(CLARITY_PROJECT_ID)
  }, [])

  useEffect(() => {
    if (!CLARITY_PROJECT_ID || !user) return

    const userData = user as Record<string, unknown>

    Clarity.identify(user.id, undefined, undefined, user.email ?? undefined)

    Clarity.setTag('user_id', user.id)
    if (user.email) Clarity.setTag('email', user.email)
    if (userData.fullName) Clarity.setTag('full_name', userData.fullName as string)
    if (userData.phoneNumber) Clarity.setTag('phone', userData.phoneNumber as string)
    if (userData.created_at) Clarity.setTag('created_at', userData.created_at as string)
    Clarity.setTag('is_guest', String(userData.isGuest ?? false))
    Clarity.setTag('newsletter', String(userData.newsletterSubscribed ?? false))
  }, [user])

  return null
}
