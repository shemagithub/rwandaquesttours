import { createFileRoute } from '@tanstack/react-router'
import { TourismCarRentalVehiclesPage } from '@/features/tourism/pages/tourism-car-rental-fleet-page'

export const Route = createFileRoute('/_authenticated/car-rental/vehicles/')({
  component: () => <TourismCarRentalVehiclesPage />,
})
