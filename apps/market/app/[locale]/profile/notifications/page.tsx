'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { useMutation } from '@tanstack/react-query'

import { updateNewsletterSubscription } from '@/data/client/mutations'
import { useUserProfile } from '@/data/client/queries'
import { SettingsRow } from '@/components/profile/settings-row'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Link } from '@/i18n/navigation'

export default function NotificationsPage() {
  const t = useTranslations('profile')
  const { dbUser } = useUserProfile()
  const { mutate: updateNewsletter, isPending } = useMutation({ mutationFn: updateNewsletterSubscription })

  const isSubscribed = dbUser?.newsletterSubscribed === true

  function handleToggle(checked: boolean) {
    updateNewsletter(checked, {
      onSuccess: () => toast.success(checked ? t('notifications.subscribed') : t('notifications.unsubscribed')),
      onError: () => toast.error(t('notifications.updateFailed')),
    })
  }

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">
        {t('notifications.title')}
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        {t('notifications.description')}{' '}
        <Link href="/privacy#directMarketing" className="font-medium underline text-foreground">
          {t('notifications.learnMore')}
        </Link>
      </p>

      <div className="mt-6">
        <SettingsRow
          label={t('notifications.smsEmailLabel')}
          action={
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={isPending}
            />
          }
        />
        <Separator />
      </div>
    </div>
  )
}
