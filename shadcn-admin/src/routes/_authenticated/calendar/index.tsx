import { createFileRoute } from '@tanstack/react-router'
import { OperationsCalendarView } from '@/features/tourism/views/operations-calendar-view'

export const Route = createFileRoute('/_authenticated/calendar/')({
  component: OperationsCalendarView,
})
