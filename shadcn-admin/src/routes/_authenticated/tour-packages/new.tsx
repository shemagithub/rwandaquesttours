import { createFileRoute } from '@tanstack/react-router'
import { TourismPackagesPage } from '@/features/tourism/pages/tourism-packages-page'

export const Route = createFileRoute('/_authenticated/tour-packages/new')({
  component: () => <TourismPackagesPage variant='new' />,
})
