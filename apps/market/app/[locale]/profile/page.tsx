'use client'

import { useTranslations } from 'next-intl'

import { routes } from '@repo/types'
import { Bell, ChevronRight, Settings } from 'lucide-react'

import { useUserProfile } from '@/data/client/queries'
import { SettingsRow } from '@/components/profile/settings-row'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Link } from '@/i18n/navigation'

const quickLinks = [
  { labelKey: 'settings', href: routes.settings(), icon: Settings },
  { labelKey: 'notificationsLabel', href: routes.notifications(), icon: Bell },
] as const

export default function ProfilePage() {
  const t = useTranslations('profile')
  const { dbUser, user } = useUserProfile()

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">{t('overview')}</h1>

      <div className="mt-6">
        <SettingsRow label={t('email')} value={user?.email ?? t('notSet')} />
        <Separator />
        <SettingsRow label={t('fullName')} value={dbUser?.fullName ?? t('notSet')} />
        <Separator />
        <SettingsRow label={t('phoneNumber')} value={dbUser?.phoneNumber ?? t('notSet')} />
        <Separator />
      </div>

      <div className="mt-8 flex flex-col gap-1">
        {quickLinks.map((item) => (
          <Button
            key={item.labelKey}
            variant="ghost"
            className="w-full justify-between px-3"
            asChild
          >
            <Link href={item.href}>
              <span className="flex items-center gap-2.5">
                <item.icon className="size-4 text-muted-foreground" />
                {t(item.labelKey)}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}
