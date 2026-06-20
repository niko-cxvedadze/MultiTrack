import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { tokenAtom } from '@/lib/auth'
import { api } from '@/lib/axios'

export function useLogin() {
  const setToken = useSetAtom(tokenAtom)

  return useCallback(
    async (email: string, password: string) => {
      const { data } = await api.post('/admin/login', { email, password })

      if (!data.success) {
        throw new Error(data.message || 'Login failed')
      }

      setToken(data.responseObject.token)
    },
    [setToken]
  )
}
