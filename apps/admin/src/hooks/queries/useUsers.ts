import { useQuery } from '@tanstack/react-query'
import type { User } from '@repo/types'

import { api } from '@/lib/axios'

interface PaginatedUsersResponse {
  items: User[]
  total: number
  limit: number
  offset: number
}

export function useUsers(limit = 20, offset = 0) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', limit, offset],
    queryFn: () =>
      api
        .get<{ responseObject: PaginatedUsersResponse }>('/admin/users', {
          params: { limit, offset },
        })
        .then((res) => res.data.responseObject),
  })

  return {
    users: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error,
  }
}

export function useUserDetail(id: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', id],
    queryFn: () =>
      api.get<{ responseObject: User }>(`/admin/users/${id}`).then((res) => res.data.responseObject),
    enabled: !!id,
  })

  return { user: data, isLoading, error }
}
