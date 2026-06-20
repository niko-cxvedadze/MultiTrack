'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { useTranslations } from 'next-intl'

import { Cookie, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import {
  acceptCookies,
  acceptCookiesAndReplay,
  closeCookieConsentDialog,
  useConsentStatus,
  useCookieConsentDialog
} from '@/data/client/consent-store'
import { db } from '@/data/client/db'

/**
 * Passive banner — fixed bottom-right, shown until user accepts.
 */
export function CookieConsent() {
  const t = useTranslations('cookieConsent')
  const status = useConsentStatus()
  const { user } = db.useAuth()

  // Wait until after hydration to render, so the server-side 'pending'
  // snapshot doesn't cause a flash when the cookie already has 'accepted'.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  // Auto-accept for logged-in users (they agreed to Terms & Privacy during registration)
  useEffect(() => {
    if (user && status === 'pending') {
      acceptCookies()
    }
  }, [user, status])

  if (!hydrated || status !== 'pending') return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-[420px] sm:bottom-5 sm:right-5">
      <div className="flex flex-col gap-3 border border-border bg-card p-4 shadow-lg sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary">
            <Cookie className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">{t('title')}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {t('message')}{' '}
              <a
                href="/privacy#cookies"
                target="_blank"
                className="font-medium text-foreground underline"
              >
                {t('learnMore')}
              </a>
            </p>
          </div>
        </div>
        <Button size="sm" onClick={acceptCookies} className="w-full">
          {t('accept')}
        </Button>
      </div>
    </div>
  )
}

/**
 * Blocking dialog — triggered when user tries to interact (e.g. add to cart)
 * without accepting cookies first.
 */
export function CookieConsentDialog() {
  const t = useTranslations('cookieConsent')
  const open = useCookieConsentDialog()

  function handleAccept() {
    acceptCookiesAndReplay()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeCookieConsentDialog()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="flex size-10 items-center justify-center bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('dialogMessage')}{' '}
            <a
              href="/privacy#cookies"
              target="_blank"
              className="font-medium text-foreground underline"
            >
              {t('learnMore')}
            </a>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleAccept} className="w-full">
            {t('accept')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
