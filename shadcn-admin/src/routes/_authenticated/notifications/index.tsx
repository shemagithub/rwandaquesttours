import { createFileRoute } from '@tanstack/react-router'
import { TourismExtrasPage } from '@/features/tourism/pages/tourism-extras-page'

export const Route = createFileRoute('/_authenticated/notifications/')({
  component: TourismExtrasPage,
})
