import axios from 'axios'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { api } from './axios'

const TOKEN_KEY = 'admin_token'

// Persisted token atom – getOnInit reads localStorage synchronously on first
// render so the auth guard doesn't flash "unauthenticated" and redirect away.
export const tokenAtom = atomWithStorage<string | null>(TOKEN_KEY, null, undefined, {
  getOnInit: true
})

// Derived: is authenticated
export const isAuthenticatedAtom = atom((get) => !!get(tokenAtom))

// Setup axios interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    // jotai/utils stores as JSON string, so parse it
    try {
      const parsed = JSON.parse(token)
      if (parsed) {
        config.headers.Authorization = `Bearer ${parsed}`
      }
    } catch {
      // raw string fallback
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auto-logout on 401 — clears stale/expired tokens so the auth guard redirects
// to login instead of showing a broken dashboard.
api.interceptors.response.use(undefined, (error) => {
  const isLoginRequest = error.config?.url?.endsWith('/login')
  if (axios.isAxiosError(error) && error.response?.status === 401 && !isLoginRequest) {
    localStorage.removeItem(TOKEN_KEY)
    window.location.replace('/login')
  }
  return Promise.reject(error)
})
