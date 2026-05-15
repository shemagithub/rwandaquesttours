import { createFileRoute } from '@tanstack/react-router'
import { TourismMessagesPage } from '@/features/tourism/pages/tourism-messages-page'

export const Route = createFileRoute('/_authenticated/messages/contact')({
  component: () => <TourismMessagesPage channel='contact' />,
})
