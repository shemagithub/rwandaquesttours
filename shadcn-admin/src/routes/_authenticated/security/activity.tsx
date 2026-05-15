import { createFileRoute } from '@tanstack/react-router'
import { TourismSecurityPage } from '@/features/tourism/pages/tourism-security-page'

export const Route = createFileRoute('/_authenticated/security/activity')({
  component: () => <TourismSecurityPage variant='activity' />,
})
