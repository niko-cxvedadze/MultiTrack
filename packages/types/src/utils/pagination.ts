/**
 * Generic server-side pagination result.
 * Slices an array and returns pagination metadata.
 */
export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  totalPages: number
  page: number
  pageSize: number
}

/**
 * Paginate an array in-memory. Returns the slice for the requested page
 * along with pagination metadata.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  const totalCount = items.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    totalCount,
    totalPages,
    page: safePage,
    pageSize,
  }
}
