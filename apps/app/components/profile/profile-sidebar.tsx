'use client'

import { useTranslations } from 'next-intl'

import { routes } from '@repo/types'
import { Bell, LogOut, Settings, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { signOut } from '@/data/client/mutations/auth'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

const menuItems = [
  { labelKey: 'overview', href: routes.profile(), icon: User },
  { labelKey: 'notificationsLabel', href: routes.notifications(), icon: Bell },
  { labelKey: 'settings', href: routes.settings(), icon: Settings },
] as const

export function ProfileSidebar() {
  const t = useTranslations('profile')
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="flex flex-col gap-1">
      {menuItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Button
            key={item.labelKey}
            variant="ghost"
            className={cn(
              'w-full justify-start gap-2.5 px-3',
              isActive && 'bg-accent font-medium'
            )}
            asChild
          >
            <Link href={item.href}>
              <item.icon className="size-4 text-muted-foreground" />
              {t(item.labelKey)}
            </Link>
          </Button>
        )
      })}

      <Separator className="my-2" />

      <Button
        variant="ghost"
        className="w-full justify-start gap-2.5 px-3 text-destructive hover:text-destructive"
        onClick={() => { signOut(); router.push('/') }}
      >
        <LogOut className="size-4" />
        {t('logout')}
      </Button>
    </nav>
  )
}
