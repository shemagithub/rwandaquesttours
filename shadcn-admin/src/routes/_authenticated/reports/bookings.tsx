import { createFileRoute } from '@tanstack/react-router'
import { TourismReportsPage } from '@/features/tourism/pages/tourism-reports-page'

export const Route = createFileRoute('/_authenticated/reports/bookings')({
  component: () => <TourismReportsPage variant='bookings' />,
})
