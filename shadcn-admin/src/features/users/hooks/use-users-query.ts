import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { type ApiTourismUser, apiUserToUser } from '../data/adapters'
import { type User } from '../data/schema'

export function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<ApiTourismUser[]>('/api/users')
      return data.map(apiUserToUser) as User[]
    },
  })
}
