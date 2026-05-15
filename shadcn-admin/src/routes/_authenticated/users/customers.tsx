import { createFileRoute } from '@tanstack/react-router'
import { TourismUsersSegmentPage } from '@/features/tourism/views/users-segment-view'

export const Route = createFileRoute('/_authenticated/users/customers')({
  component: () => (
    <TourismUsersSegmentPage
      segment='customer'
      title='Customers'
      description='End users who book tours and interact with your site.'
    />
  ),
})
