'use client'

import { User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { db } from '@/data/client/db'
import { AuthModal } from '@/components/auth/auth-modal'
import { UserMenuPopover } from '@/components/layout/user-menu-popover'
import { Button } from '@/components/ui/button'

export function HeaderActions() {
  const t = useTranslations('header')
  const { user, isLoading } = db.useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const isAuthenticated = !!user

  return (
    <>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {isLoading ? (
          <Button size="lg" variant="secondary" className="bg-header-btn-bg text-header-fg" disabled>
            <User className="size-5" />
          </Button>
        ) : isAuthenticated ? (
          <UserMenuPopover email={user.email!} />
        ) : (
          <Button size="lg" variant="secondary" className="bg-header-btn-bg text-header-fg hover:bg-header-btn-bg-hover" onClick={() => setAuthModalOpen(true)}>
            <User className="size-5" />
            <span className="hidden sm:inline">{t('login')}</span>
          </Button>
        )}
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  )
}
