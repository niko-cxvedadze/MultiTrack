import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { tokenAtom } from '@/lib/auth'

export function useLogout() {
  const setToken = useSetAtom(tokenAtom)
  return useCallback(() => setToken(null), [setToken])
}
