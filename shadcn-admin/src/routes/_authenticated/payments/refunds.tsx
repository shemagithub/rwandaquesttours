import { createFileRoute } from '@tanstack/react-router'
import { TourismPaymentsPage } from '@/features/tourism/pages/tourism-payments-page'

export const Route = createFileRoute('/_authenticated/payments/refunds')({
  component: () => <TourismPaymentsPage variant='refunds' />,
})
