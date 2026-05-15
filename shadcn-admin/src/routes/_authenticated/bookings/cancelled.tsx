import { createFileRoute } from '@tanstack/react-router'
import { TourismBookingsPage } from '@/features/tourism/pages/tourism-bookings-page'

export const Route = createFileRoute('/_authenticated/bookings/cancelled')({
  component: () => <TourismBookingsPage statusFilter='cancelled' />,
})
