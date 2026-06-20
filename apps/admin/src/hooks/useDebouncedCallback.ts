import { useEffect, useMemo, useRef } from 'react'

import { debounce } from 'lodash-es'

/**
 * Returns a debounced version of the given callback.
 * The callback ref is always up-to-date (no stale closures).
 * Automatically cancelled on unmount.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 600
): T {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const debounced = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => debounce((...args: any[]) => callbackRef.current(...args), delay),
    [delay]
  )

  useEffect(() => {
    return () => {
      debounced.cancel()
    }
  }, [debounced])

  return debounced as unknown as T
}
