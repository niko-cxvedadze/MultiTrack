'use client'

import { api } from '../axios'

export async function updateFullName(fullName: string): Promise<void> {
  await api.put('/me/full-name', { fullName })
}

export async function updateNewsletterSubscription(newsletterSubscribed: boolean): Promise<void> {
  await api.put('/me/newsletter', { newsletterSubscribed })
}
