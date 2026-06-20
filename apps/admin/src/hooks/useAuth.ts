import { useAtomValue } from 'jotai'

import { isAuthenticatedAtom, tokenAtom } from '@/lib/auth'

export function useAuth() {
  const token = useAtomValue(tokenAtom)
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  return { token, isAuthenticated }
}
