'use client'

import { useEffect, useState } from 'react'

import { MOBILE_BREAKPOINT } from '@repo/types'

import { Toaster } from '@/components/ui/sonner'

export function ResponsiveToaster() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches)
    onChange(mql)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return <Toaster position={isMobile ? 'top-center' : 'bottom-right'} />
}
