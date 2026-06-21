import { ArrowLeft, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface NotFoundContentProps {
  title: string
  description: string
  backLabel: string
  backHref: string
}

export function NotFoundContent({
  title,
  description,
  backLabel,
  backHref,
}: NotFoundContentProps) {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex size-24 items-center justify-center border border-border bg-muted/20 sm:size-28">
          <Package className="size-10 text-muted-foreground/50 sm:size-12" />
        </div>

        {/* 404 number */}
        <span className="mb-2 text-5xl font-black tracking-tighter text-foreground sm:text-6xl">
          404
        </span>

        {/* Title */}
        <h1 className="mb-3 text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {title}
        </h1>

        {/* Description */}
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <Separator className="mb-8" />

        {/* Action */}
        <Button size="lg" className="h-11 gap-2 text-sm font-semibold" asChild>
          <a href={backHref}>
            <ArrowLeft className="size-4" />
            {backLabel}
          </a>
        </Button>
      </div>
    </div>
  )
}
