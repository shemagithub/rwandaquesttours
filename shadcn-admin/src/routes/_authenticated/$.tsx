import { createFileRoute } from '@tanstack/react-router'
import { ModulePlaceholder } from '@/features/module-placeholder'

export const Route = createFileRoute('/_authenticated/$')({
  component: AuthenticatedCatchAll,
})

function AuthenticatedCatchAll() {
  const splat = Route.useParams({
    select: (p) => p._splat as string | undefined,
  })
  const title = splat
    ? splat
        .split('/')
        .map((s) => s.replace(/-/g, ' '))
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' · ')
    : undefined

  return <ModulePlaceholder title={title} />
}
