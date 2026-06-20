'use client'

import { first } from 'lodash-es'

import { db } from '../db'

export function useUserProfile() {
  const { user, isLoading: isAuthLoading } = db.useAuth()
  const userId = user?.id

  const { data, isLoading: isQueryLoading } = db.useQuery(
    userId ? { $users: { $: { where: { id: userId } } } } : null,
  )

  const dbUser = first(data?.$users)

  return {
    user,
    dbUser,
    isLoading: isAuthLoading || isQueryLoading,
  }
}
