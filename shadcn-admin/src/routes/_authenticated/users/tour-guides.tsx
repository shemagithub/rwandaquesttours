import { createFileRoute } from '@tanstack/react-router'
import { TourismUsersPage } from '@/features/tourism/pages/tourism-users-page'

export const Route = createFileRoute('/_authenticated/users/tour-guides')({
  component: () => (
    <TourismUsersPage
      segment='guide'
      title='Tour guide accounts'
      description='Guides linked to assignments and availability.'
    />
  ),
})
