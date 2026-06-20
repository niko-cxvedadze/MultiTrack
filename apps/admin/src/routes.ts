/**
 * Centralized admin route definitions.
 * Use `adminRoutes` methods for navigation and `ADMIN_PATHS` for Route definitions.
 */

export const adminRoutes = {
  home: () => '/',
  login: () => '/login',

  dashboard: () => '/dashboard',

  users: () => '/users',
  userDetail: (id: string) => `/users/${id}`
} as const

export const ADMIN_PATHS = {
  LOGIN: '/login',
  DASHBOARD: 'dashboard',
  USERS: 'users',
  USER_DETAIL: 'users/:id'
} as const
