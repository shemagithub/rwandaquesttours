import { createFileRoute } from '@tanstack/react-router'
import { TourismReviewsPage } from '@/features/tourism/pages/tourism-reviews-page'

export const Route = createFileRoute('/_authenticated/reviews/pending')({
  component: () => <TourismReviewsPage pendingOnly />,
})
