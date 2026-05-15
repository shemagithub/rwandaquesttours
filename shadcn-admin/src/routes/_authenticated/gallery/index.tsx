import { createFileRoute } from '@tanstack/react-router'
import { TourismGalleryPage } from '@/features/tourism/pages/tourism-gallery-page'

export const Route = createFileRoute('/_authenticated/gallery/')({
  component: () => <TourismGalleryPage variant='list' />,
})
