import { createFileRoute } from '@tanstack/react-router'
import { TourismGuidesPage } from '@/features/tourism/pages/tourism-guides-page'

export const Route = createFileRoute('/_authenticated/guides/')({
  component: () => <TourismGuidesPage variant='list' />,
})
