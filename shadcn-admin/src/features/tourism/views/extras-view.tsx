import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useBootstrapQuery } from '@/hooks/use-bootstrap-query'
import { TourismAdminShell } from '../components/tourism-admin-shell'

export function TourismExtrasPage() {
  const { data: boot, refetch, isPending } = useBootstrapQuery()

  const notes = boot?.notifications as
    | {
        id: string
        type: string
        title: string
        read: boolean
        createdAt: string
      }[]
    | undefined

  return (
    <TourismAdminShell
      title='Notifications'
      description='Admin alerts (system, payments, inquiries).'
      actions={
        <Button variant='outline' size='sm' onClick={() => void refetch()}>
          <RefreshCw className='me-1 size-4' />
          Refresh
        </Button>
      }
    >
      <Card>
        <CardContent className='space-y-3 pt-6'>
          {isPending ? (
            <p className='text-muted-foreground text-sm'>Loading…</p>
          ) : (
            (notes ?? []).map((n) => (
              <div
                key={n.id}
                className='bg-muted/40 flex items-start justify-between rounded-md border px-3 py-2'
              >
                <div>
                  <p className='font-medium'>{n.title}</p>
                  <p className='text-muted-foreground text-xs'>{n.type}</p>
                </div>
                <span className='text-muted-foreground text-xs'>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </TourismAdminShell>
  )
}
