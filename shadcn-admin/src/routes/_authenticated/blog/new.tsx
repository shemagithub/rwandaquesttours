import { createFileRoute } from '@tanstack/react-router'
import { TourismBlogPage } from '@/features/tourism/pages/tourism-blog-page'

export const Route = createFileRoute('/_authenticated/blog/new')({
  component: () => <TourismBlogPage variant='new' />,
})
