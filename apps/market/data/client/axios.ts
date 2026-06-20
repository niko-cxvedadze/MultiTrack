import axios from 'axios'

import { db } from './db'

const API_URL = process.env.NEXT_PUBLIC_API_URL_NEW || 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach InstantDB refresh token to every request when available
api.interceptors.request.use(async (config) => {
  const user = await db.getAuth()
  if (user?.refresh_token) {
    config.headers.Authorization = `Bearer ${user.refresh_token}`
  }
  return config
})
