'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { routes } from '@repo/types'
import { Bell, LogOut, Settings, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

import { signOut } from '@/data/client/mutations/auth'
import { Link, useRouter } from '@/i18n/navigation'

interface UserMenuPopoverProps {
  email: string
}

const menuItems = [
  { labelKey: 'profile', href: routes.profile(), icon: User },
  { labelKey: 'notificationsLabel', href: routes.notifications(), icon: Bell },
  { labelKey: 'settings', href: routes.settings(), icon: Settings }
] as const

export function UserMenuPopover({ email }: UserMenuPopoverProps) {
  const t = useTranslations('header')
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="lg" variant="secondary" className="relative bg-header-btn-bg text-header-fg hover:bg-header-btn-bg-hover">
          <User className="size-5" />
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center bg-green-500 px-1 text-[10px] font-bold text-background">✓</span>
          <span className="hidden sm:inline">{t('myAccount')}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-56 p-0 gap-0">
        {/* User info */}
        <div className="px-3 py-2.5">
          <p className="text-sm font-medium">{t('myAccount')}</p>
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        </div>

        <Separator />

        {/* Menu items */}
        <div>
          {menuItems.map((item) => (
            <Button
              key={item.labelKey}
              variant="ghost"
              className="w-full justify-start gap-2.5 px-3"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href={item.href}>
                <item.icon className="size-4 text-muted-foreground" />
                {t(item.labelKey)}
              </Link>
            </Button>
          ))}
        </div>

        <Separator />

        {/* Sign out */}
        <div className="py-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 px-3 text-destructive hover:text-destructive"
            onClick={() => { setOpen(false); signOut(); router.push('/') }}
          >
            <LogOut className="size-4" />
            {t('logout')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
