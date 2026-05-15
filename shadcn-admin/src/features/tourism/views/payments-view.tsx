import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { handleServerError } from '@/lib/handle-server-error'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ResourceRowActions } from '@/components/shared/resource-row-actions'
import { TourismAdminShell } from '../components/tourism-admin-shell'
import { usePaymentsQuery } from '../hooks/use-tourism-queries'

type Pay = {
  id: string
  bookingId: string
  amountRwf: number
  status: string
  method: string
  reference: string
  createdAt: string
}

const statusChoices = ['unpaid', 'paid', 'pending', 'refunded']

export function TourismPaymentsPage({
  variant,
}: {
  variant: 'transactions' | 'status' | 'refunds'
}) {
  const qc = useQueryClient()
  const { data = [], isPending, refetch } = usePaymentsQuery()

  const [viewP, setViewP] = useState<Pay | null>(null)
  const [editP, setEditP] = useState<Pay | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [deleteP, setDeleteP] = useState<Pay | null>(null)
  const [deleting, setDeleting] = useState(false)

  const rows = useMemo(() => {
    const list = data as Pay[]
    if (variant === 'refunds')
      return list.filter((p) => /refund|revers/i.test(p.status))
    return list
  }, [data, variant])

  const totalPaid = useMemo(() => {
    return (data as Pay[])
      .filter((p) => p.status === 'paid' || p.status === 'completed')
      .reduce((s, p) => s + (p.amountRwf || 0), 0)
  }, [data])

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editP) return
    setEditSaving(true)
    try {
      await api.patch(`/api/payments/${editP.id}`, {
        status: editP.status,
        amountRwf: editP.amountRwf,
        method: editP.method,
        reference: editP.reference,
      })
      toast.success('Saved')
      setEditP(null)
      await qc.invalidateQueries({ queryKey: ['payments'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setEditSaving(false)
    }
  }

  const doDelete = async () => {
    if (!deleteP) return
    setDeleting(true)
    try {
      await api.delete(`/api/payments/${deleteP.id}`)
      toast.success('Payment deleted')
      setDeleteP(null)
      await qc.invalidateQueries({ queryKey: ['payments'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setDeleting(false)
    }
  }

  const title =
    variant === 'refunds'
      ? 'Refunds'
      : variant === 'status'
        ? 'Payment status'
        : 'Transactions'

  return (
    <TourismAdminShell
      title={title}
      description={
        variant === 'status'
          ? 'Review paid vs unpaid. Integrate Flutterwave webhooks for live updates.'
          : 'All payment records from bookings.'
      }
      actions={
        <Button variant='outline' size='sm' onClick={() => void refetch()}>
          <RefreshCw className='me-1 size-4' />
          Refresh
        </Button>
      }
    >
      {variant === 'transactions' && (
        <Card className='mb-4'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base'>Revenue snapshot</CardTitle>
            <CardDescription>
              Sum of completed/paid rows:{' '}
              <span className='text-foreground font-semibold'>
                {totalPaid.toLocaleString()} Rwf
              </span>
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      <Card>
        <CardContent className='pt-6'>
          {isPending ? (
            <p className='text-muted-foreground text-sm'>Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Booking</TableHead>
                  <TableHead>Amount (Rwf)</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className='font-mono text-xs'>{p.reference}</TableCell>
                    <TableCell className='font-mono text-xs'>{p.bookingId}</TableCell>
                    <TableCell>{p.amountRwf?.toLocaleString?.()}</TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell className='text-right'>
                      <ResourceRowActions
                        onView={() => setViewP(p)}
                        onEdit={
                          variant === 'refunds'
                            ? undefined
                            : () => setEditP({ ...p })
                        }
                        onDelete={() => setDeleteP(p)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewP} onOpenChange={(o) => !o && setViewP(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription className='font-mono text-xs'>{viewP?.id}</DialogDescription>
          </DialogHeader>
          {viewP ? (
            <div className='space-y-2 text-sm'>
              <p>
                <span className='text-muted-foreground'>Reference:</span> {viewP.reference}
              </p>
              <p>
                <span className='text-muted-foreground'>Booking:</span> {viewP.bookingId}
              </p>
              <p>
                <span className='text-muted-foreground'>Amount:</span>{' '}
                {viewP.amountRwf?.toLocaleString()} Rwf
              </p>
              <p>
                <span className='text-muted-foreground'>Method:</span> {viewP.method}
              </p>
              <p>
                <span className='text-muted-foreground'>Status:</span> {viewP.status}
              </p>
              <p className='text-muted-foreground text-xs'>
                {new Date(viewP.createdAt).toLocaleString()}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editP} onOpenChange={(o) => !o && setEditP(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit payment</DialogTitle>
          </DialogHeader>
          {editP ? (
            <form onSubmit={saveEdit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='pam'>Amount (Rwf)</Label>
                <Input
                  id='pam'
                  type='number'
                  min={0}
                  value={editP.amountRwf}
                  onChange={(e) =>
                    setEditP({ ...editP, amountRwf: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='pst'>Status</Label>
                <select
                  id='pst'
                  className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                  value={editP.status}
                  onChange={(e) => setEditP({ ...editP, status: e.target.value })}
                >
                  {statusChoices.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='pme'>Method</Label>
                <Input
                  id='pme'
                  value={editP.method}
                  onChange={(e) => setEditP({ ...editP, method: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='pref'>Reference</Label>
                <Input
                  id='pref'
                  value={editP.reference}
                  onChange={(e) => setEditP({ ...editP, reference: e.target.value })}
                />
              </div>
              <Button type='submit' disabled={editSaving}>
                {editSaving ? 'Saving…' : 'Save'}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteP}
        onOpenChange={(o) => (o ? null : setDeleteP(null))}
        title='Delete payment record?'
        desc={<span>Remove payment {deleteP?.reference}?</span>}
        destructive
        isLoading={deleting}
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        handleConfirm={() => void doDelete()}
      />
    </TourismAdminShell>
  )
}
