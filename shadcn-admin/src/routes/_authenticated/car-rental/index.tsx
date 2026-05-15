import { createFileRoute } from '@tanstack/react-router'
import { TourismCarRentalRequestsPage } from '@/features/tourism/pages/tourism-car-rental-page'

export const Route = createFileRoute('/_authenticated/car-rental/')({
  component: () => <TourismCarRentalRequestsPage />,
})
