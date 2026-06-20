import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  message: string
  title?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, message, title, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="flex size-16 items-center justify-center bg-muted">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      {title && (
        <h2 className="mt-4 text-xl font-bold">{title}</h2>
      )}
      <p className="mt-4 max-w-sm text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
