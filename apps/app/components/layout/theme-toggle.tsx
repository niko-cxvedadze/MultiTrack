'use client'

import { useSyncExternalStore } from 'react'

import { useTheme } from 'next-themes'

import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'

const emptySubscribe = () => () => {}
const returnTrue = () => true
const returnFalse = () => false

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, returnTrue, returnFalse)

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-7 text-header-topbar-fg/50">
        <Sun className="size-3.5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7 text-header-topbar-fg/50 hover:text-header-topbar-fg/80 hover:bg-transparent"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </Button>
  )
}
