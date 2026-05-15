import { createFileRoute } from '@tanstack/react-router'
import { LiveTrackingView } from '@/features/tourism/views/live-tracking-view'

export const Route = createFileRoute('/_authenticated/tracking/')({
  component: LiveTrackingView,
})
