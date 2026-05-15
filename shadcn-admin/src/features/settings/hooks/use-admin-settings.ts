import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type AdminSettingsPayload = {
  profile?: {
    username?: string
    email?: string
    bio?: string
    urls?: { value: string }[]
  }
  account?: {
    name?: string
    dob?: string // yyyy-mm-dd
    language?: string
  }
  notifications?: {
    type?: 'all' | 'mentions' | 'none'
    mobile?: boolean
    communication_emails?: boolean
    social_emails?: boolean
    marketing_emails?: boolean
    security_emails?: boolean
  }
  display?: {
    items?: string[]
  }
  appearance?: {
    theme?: 'light' | 'dark'
    font?: string
  }
}

export function useAdminSettingsQuery() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => (await api.get('/api/admin-settings')).data as AdminSettingsPayload,
  })
}

