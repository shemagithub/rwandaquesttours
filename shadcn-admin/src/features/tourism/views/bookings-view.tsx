import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import {
  useBookingsQuery,
  useTourGuidesQuery,
  useTourPackagesQuery,
  useUsersApiQuery,
} from '../hooks/use-tourism-queries'

type Booking = {
  id: string
  userId: string
  packageId: string
  startDate: string
  status: string
  totalRwf: number
  guideId: string | null
}

const statusOptions = ['pending', 'confirmed', 'cancelled'] as const

export function TourismBookingsPage({
  statusFilter,
}: {
  statusFilter?: 'pending' | 'confirmed' | 'cancelled'
}) {
  const qc = useQueryClient()
  const { data = [], isPending, refetch } = useBookingsQuery()
  const { data: guides = [] } = useTourGuidesQuery()
  const { data: packages = [] } = useTourPackagesQuery()
  const { data: users = [] } = useUsersApiQuery()

  const [viewB, setViewB] = useState<Booking | null>(null)
  const [editB, setEditB] = useState<Booking | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [deleteB, setDeleteB] = useState<Booking | null>(null)
  const [deleting, setDeleting] = useState(false)

  const pkgTitle = (id: string) =>
    (packages as { id: string; title: string }[]).find((p) => p.id === id)?.title ?? id
  const userLabel = (id: string) => {
    const u = (users as { id: string; firstName: string; lastName: string }[]).find(
      (x) => x.id === id,
    )
    return u ? `${u.firstName} ${u.lastName}`.trim() : id.slice(0, 8)
  }
  const guideLabel = (gid: string | null) => {
    if (!gid) return '—'
    const g = (guides as { id: string; userId: string }[]).find((x) => x.id === gid)
    if (!g) return gid.slice(0, 8)
    return userLabel(g.userId)
  }

  const rows = useMemo(() => {
    const list = data as Booking[]
    if (!statusFilter) return list
    return list.filter((b) => b.status === statusFilter)
  }, [data, statusFilter])

  const update = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Pick<Booking, 'status' | 'guideId' | 'startDate' | 'totalRwf'>>
    }) => {
      await api.patch(`/api/bookings/${id}`, patch)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['bootstrap'] })
      toast.success('Booking updated')
    },
    onError: handleServerError,
  })

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editB) return
    setEditSaving(true)
    try {
      await api.patch(`/api/bookings/${editB.id}`, {
        status: editB.status,
        guideId: editB.guideId,
        startDate: editB.startDate.slice(0, 10),
        totalRwf: editB.totalRwf,
      })
      toast.success('Booking saved')
      setEditB(null)
      await qc.invalidateQueries({ queryKey: ['bookings'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setEditSaving(false)
    }
  }

  const doDelete = async () => {
    if (!deleteB) return
    setDeleting(true)
    try {
      await api.delete(`/api/bookings/${deleteB.id}`)
      toast.success('Booking deleted')
      setDeleteB(null)
      await qc.invalidateQueries({ queryKey: ['bookings'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setDeleting(false)
    }
  }

  const title =
    statusFilter === 'pending'
      ? 'Pending bookings'
      : statusFilter === 'confirmed'
        ? 'Confirmed bookings'
        : statusFilter === 'cancelled'
          ? 'Cancelled bookings'
          : 'All bookings'

  return (
    <TourismAdminShell
      title={title}
      description='Update status and assign guides. Customer-facing status can mirror these values.'
      actions={
        <Button variant='outline' size='sm' onClick={() => void refetch()}>
          <RefreshCw className='me-1 size-4' />
          Refresh
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>
            Export to Excel/PDF can be added with a server endpoint later.
          </CardDescription>
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          {isPending ? (
            <p className='text-muted-foreground text-sm'>Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Total (Rwf)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Guide</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className='max-w-[200px] truncate text-sm'>
                      {pkgTitle(b.packageId)}
                    </TableCell>
                    <TableCell>{b.startDate}</TableCell>
                    <TableCell>{b.totalRwf?.toLocaleString?.() ?? b.totalRwf}</TableCell>
                    <TableCell>
                      <select
                        className='border-input bg-background rounded-md border px-2 py-1 text-sm'
                        value={b.status}
                        onChange={(e) =>
                          update.mutate({
                            id: b.id,
                            patch: { status: e.target.value },
                          })
                        }
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <select
                        className='border-input bg-background max-w-[180px] rounded-md border px-2 py-1 text-sm'
                        value={b.guideId ?? ''}
                        onChange={(e) =>
                          update.mutate({
                            id: b.id,
                            patch: {
                              guideId: e.target.value || null,
                            },
                          })
                        }
                      >
                        <option value=''>— Unassigned —</option>
                        {(guides as { id: string; userId: string }[]).map((g) => (
                          <option key={g.id} value={g.id}>
                            {guideLabel(g.id)}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className='text-right'>
                      <ResourceRowActions
                        onView={() => setViewB(b)}
                        onEdit={() => setEditB({ ...b })}
                        onDelete={() => setDeleteB(b)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewB} onOpenChange={(o) => !o && setViewB(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Booking</DialogTitle>
            <DialogDescription>{viewB?.id}</DialogDescription>
          </DialogHeader>
          {viewB ? (
            <div className='space-y-2 text-sm'>
              <p>
                <span className='text-muted-foreground'>Package:</span> {pkgTitle(viewB.packageId)}
              </p>
              <p>
                <span className='text-muted-foreground'>Guest:</span> {userLabel(viewB.userId)}
              </p>
              <p>
                <span className='text-muted-foreground'>Start:</span> {viewB.startDate}
              </p>
              <p>
                <span className='text-muted-foreground'>Total:</span>{' '}
                {viewB.totalRwf?.toLocaleString()} Rwf
              </p>
              <p>
                <span className='text-muted-foreground'>Status:</span> {viewB.status}
              </p>
              <p>
                <span className='text-muted-foreground'>Guide:</span> {guideLabel(viewB.guideId)}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editB} onOpenChange={(o) => !o && setEditB(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit booking</DialogTitle>
          </DialogHeader>
          {editB ? (
            <form onSubmit={saveEdit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='bsd'>Start date</Label>
                <Input
                  id='bsd'
                  type='date'
                  value={editB.startDate.slice(0, 10)}
                  onChange={(e) => setEditB({ ...editB, startDate: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='bto'>Total (Rwf)</Label>
                <Input
                  id='bto'
                  type='number'
                  min={0}
                  value={editB.totalRwf}
                  onChange={(e) =>
                    setEditB({ ...editB, totalRwf: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='bst'>Status</Label>
                <select
                  id='bst'
                  className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                  value={editB.status}
                  onChange={(e) => setEditB({ ...editB, status: e.target.value })}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='bg'>Guide</Label>
                <select
                  id='bg'
                  className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                  value={editB.guideId ?? ''}
                  onChange={(e) =>
                    setEditB({ ...editB, guideId: e.target.value || null })
                  }
                >
                  <option value=''>— Unassigned —</option>
                  {(guides as { id: string; userId: string }[]).map((g) => (
                    <option key={g.id} value={g.id}>
                      {guideLabel(g.id)}
                    </option>
                  ))}
                </select>
              </div>
              <Button type='submit' disabled={editSaving}>
                {editSaving ? 'Saving…' : 'Save'}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteB}
        onOpenChange={(o) => (o ? null : setDeleteB(null))}
        title='Delete booking?'
        desc={<span>Permanently remove this booking record.</span>}
        destructive
        isLoading={deleting}
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        handleConfirm={() => void doDelete()}
      />
    </TourismAdminShell>
  )
}
