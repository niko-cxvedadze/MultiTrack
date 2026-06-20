'use client'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { useMutation } from '@tanstack/react-query'

import { updateFullName } from '@/data/client/mutations'
import { useUserProfile } from '@/data/client/queries'
import { SettingsRow } from '@/components/profile/settings-row'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const t = useTranslations('profile')
  const { dbUser, user } = useUserProfile()
  const { mutateAsync } = useMutation({ mutationFn: updateFullName })

  async function handleFullNameSave(fullName: string) {
    try {
      await mutateAsync(fullName)
      toast.success(t('fullNameUpdated'))
    } catch {
      toast.error(t('fullNameUpdateFailed'))
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight">{t('settingsTitle')}</h1>

      <div className="mt-6">
        <SettingsRow label={t('email')} value={user?.email ?? t('notSet')} />
        <Separator />

        <SettingsRow
          label={t('fullName')}
          value={dbUser?.fullName ?? ''}
          onSave={handleFullNameSave}
        />
        <Separator />

        <SettingsRow
          label={t('phoneNumber')}
          value={dbUser?.phoneNumber ?? t('notSet')}
        />
        <Separator />
      </div>
    </div>
  )
}
