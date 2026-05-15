import type { LinkProps } from '@tanstack/react-router'

/**
 * Paths that map to concrete file routes (not the authenticated splat `/$`).
 * Keep in sync with `routeTree.gen.ts` authenticated routes.
 */
const STATIC_ROUTES = new Set([
  '/',
  '/users',
  '/users/customers',
  '/users/staff',
  '/users/tour-guides',
  '/tasks',
  '/help-center',
  '/chats',
  '/apps',
  '/tour-packages',
  '/tour-packages/new',
  '/tour-packages/categories',
  '/tour-packages/itineraries',
  '/destinations',
  '/destinations/new',
  '/bookings',
  '/bookings/pending',
  '/bookings/confirmed',
  '/bookings/cancelled',
  '/car-rental',
  '/car-rental/pending',
  '/car-rental/vehicles',
  '/car-rental/vehicles/new',
  '/payments/transactions',
  '/payments/status',
  '/payments/refunds',
  '/blog',
  '/blog/new',
  '/blog/categories',
  '/gallery',
  '/gallery/upload',
  '/reviews',
  '/reviews/pending',
  '/messages/inquiries',
  '/messages/contact',
  '/guides',
  '/guides/assign',
  '/guides/availability',
  '/calendar',
  '/tracking',
  '/notifications',
  '/reports/revenue',
  '/reports/bookings',
  '/reports/analytics',
  '/security/roles',
  '/security/activity',
  '/settings',
  '/settings/account',
  '/settings/appearance',
  '/settings/display',
  '/settings/notifications',
  '/settings/content',
  '/settings/seo',
  '/settings/social',
])

function normalizePath(path: string): string {
  if (path === '/' || path === '') return '/'
  return path.replace(/\/$/, '')
}

/** Turn a pathname string into props for `<Link />` or `navigate()`. */
export function resolveNavTo(path: string): LinkProps {
  const n = normalizePath(path)
  if (n === '/') {
    return { to: '/' }
  }
  if (STATIC_ROUTES.has(n)) {
    return { to: n as LinkProps['to'] }
  }
  const splat = n.startsWith('/') ? n.slice(1) : n
  return { to: '/$', params: { _splat: splat } }
}
