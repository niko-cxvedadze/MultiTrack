import { Package } from 'lucide-react'

import { getLucideIconUrl } from '@repo/types'

/** Render a Lucide icon from CDN — loads only the icons actually used */
export function LucideCdnIcon({ name, className }: { name: string | undefined; className?: string }) {
  if (!name) return <Package className={className ?? 'size-4 shrink-0'} />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getLucideIconUrl(name)}
      alt=""
      width={16}
      height={16}
      className={`dark:invert ${className ?? 'size-4 shrink-0'}`}
      loading="lazy"
    />
  )
}
