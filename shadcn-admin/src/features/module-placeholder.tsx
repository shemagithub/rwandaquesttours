import { useRouterState } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ModulePlaceholderProps = {
  /** Human-readable title; defaults from URL path */
  title?: string
}

function titleCaseFromPath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map((s) => s.replace(/-/g, ' '))
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' · ')
}

export function ModulePlaceholder({ title }: ModulePlaceholderProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const display = title ?? (titleCaseFromPath(pathname) || 'Module')

  return (
    <div className='mx-auto w-full max-w-2xl p-6'>
      <Card>
        <CardHeader>
          <CardTitle>{display}</CardTitle>
          <CardDescription>
            Placeholder view for this area of the tourism admin. Replace with
            real content when the feature is implemented.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground font-mono text-sm'>{pathname}</p>
        </CardContent>
      </Card>
    </div>
  )
}
