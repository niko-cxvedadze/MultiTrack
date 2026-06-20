/**
 * Centralized route definitions with type-safe path builders.
 * All route paths should be defined here instead of hardcoded strings.
 */

/**
 * Route path builders - use these methods instead of hardcoding paths
 */
export const routes = {
  /** Home page */
  home: () => '/',

  /** Login page */
  login: () => '/login',

  /** User profile/dashboard */
  profile: () => '/profile',

  /** User settings */
  settings: () => '/profile/settings',

  /** User notification preferences */
  notifications: () => '/profile/notifications',

  /** Terms and conditions page */
  terms: () => '/terms',

  /** Privacy policy page */
  privacy: () => '/privacy',
} as const

/**
 * Route paths as constants (for Route definitions in App.tsx)
 */
export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  PROFILE: '/profile',
  SETTINGS: '/profile/settings',
  NOTIFICATIONS: '/profile/notifications',
  TERMS: '/terms',
  PRIVACY: '/privacy',
} as const
