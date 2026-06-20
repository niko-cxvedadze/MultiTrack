import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const variantStyles = {
  default: 'flex gap-4 border-b border-border p-4 last:border-b-0 sm:gap-6 sm:p-5',
  compact: 'flex gap-3 border-b border-border py-3 last:border-b-0',
} as const

interface ItemRowProps {
  children: ReactNode
  /** default = cart/wishlist page rows, compact = drawer rows */
  variant?: keyof typeof variantStyles
  className?: string
}

export function ItemRow({ children, variant = 'default', className }: ItemRowProps) {
  return (
    <div className={cn(variantStyles[variant], className)}>
      {children}
    </div>
  )
}
