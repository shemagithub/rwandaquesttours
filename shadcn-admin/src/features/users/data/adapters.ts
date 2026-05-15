import { type User, type UserStatus } from './schema'

/** Shape returned by `GET /api/users` */
export type ApiTourismUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  status: string
  createdAt: string
}

function normalizeStatus(raw: string): UserStatus {
  if (raw === 'inactive') return 'inactive'
  if (raw === 'invited') return 'invited'
  if (raw === 'suspended') return 'suspended'
  return 'active'
}

function normalizeRole(raw: string): User['role'] {
  const allowed: User['role'][] = [
    'superadmin',
    'admin',
    'cashier',
    'manager',
    'customer',
    'staff',
    'tour_guide',
  ]
  if (allowed.includes(raw as User['role'])) return raw as User['role']
  return 'customer'
}

export function apiUserToUser(r: ApiTourismUser): User {
  const username = r.email.includes('@')
    ? r.email.split('@')[0]!
    : r.email || r.id.slice(0, 8)
  const created = new Date(r.createdAt)
  return {
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    username,
    email: r.email,
    phoneNumber: r.phone ?? '',
    status: normalizeStatus(r.status),
    role: normalizeRole(r.role),
    createdAt: created,
    updatedAt: created,
  }
}
