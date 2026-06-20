import { Skeleton } from '@/components/ui/skeleton'
import { ItemRow } from './item-row'

interface ItemRowSkeletonProps {
  count?: number
}

export function ItemRowSkeleton({ count = 3 }: ItemRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ItemRow key={i}>
          <Skeleton className="size-20 shrink-0 sm:size-28" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-auto h-8 w-32" />
          </div>
        </ItemRow>
      ))}
    </>
  )
}
