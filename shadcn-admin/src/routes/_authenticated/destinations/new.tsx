import { createFileRoute } from '@tanstack/react-router'
import { TourismDestinationsPage } from '@/features/tourism/pages/tourism-destinations-page'

export const Route = createFileRoute('/_authenticated/destinations/new')({
  component: () => <TourismDestinationsPage variant='new' />,
})
