import { createFileRoute } from '@tanstack/react-router'
import { TourismCarRentalVehicleFormPage } from '@/features/tourism/pages/tourism-car-rental-vehicle-form-page'

export const Route = createFileRoute('/_authenticated/car-rental/vehicles/$vehicleId')({
  component: VehicleEditRoute,
})

function VehicleEditRoute() {
  const { vehicleId } = Route.useParams()
  return <TourismCarRentalVehicleFormPage vehicleId={vehicleId} />
}
