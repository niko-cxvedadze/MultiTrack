'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { LogIn, User } from 'lucide-react'

import { AuthModal } from '@/components/auth/auth-modal'
import { Container } from '@/components/layout/container'
import { EmptyState } from '@/components/shared/empty-state'
import { ProfileSidebar } from '@/components/profile/profile-sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { db } from '@/data/client/db'

interface ProfileLayoutProps {
  children: React.ReactNode
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { isLoading, user } = db.useAuth()
  const t = useTranslations('profile')
  const tAuth = useTranslations('auth')
  const [authModalOpen, setAuthModalOpen] = useState(true)

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="h-64 animate-pulse bg-muted" />
      </Container>
    )
  }

  if (!user) {
    return (
      <Container className="py-12 sm:py-16">
        <EmptyState
          icon={LogIn}
          title={t('loginRequired')}
          message=""
          action={
            <Button size="lg" onClick={() => setAuthModalOpen(true)}>
              {tAuth('login')}
            </Button>
          }
        />
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </Container>
    )
  }

  return (
    <div>
      {/* Top banner */}
      <div className="border-b border-border">
        <Container className="flex items-center gap-3 py-4">
          <div className="flex size-10 items-center justify-center bg-primary">
            <User className="size-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">{t('myAccount')}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </Container>
      </div>

      {/* Content area */}
      <Container className="py-6">
        <div className="flex gap-8">
          {/* Sidebar — hidden on mobile */}
          <aside className="hidden w-56 shrink-0 md:block">
            <ProfileSidebar />
          </aside>

          <Separator orientation="vertical" className="hidden self-stretch md:block" />

          {/* Main content */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </Container>
    </div>
  )
}
