import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { handleServerError } from '@/lib/handle-server-error'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
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
import { useReviewsQuery, useTourPackagesQuery, useUsersApiQuery } from '../hooks/use-tourism-queries'

type Rev = {
  id: string
  userId: string
  packageId: string
  rating: number
  comment: string
  status: string
  featured: boolean
  createdAt: string
}

export function TourismReviewsPage({ pendingOnly }: { pendingOnly?: boolean }) {
  const qc = useQueryClient()
  const { data = [], isPending, refetch } = useReviewsQuery()
  const { data: packages = [] } = useTourPackagesQuery()
  const { data: users = [] } = useUsersApiQuery()

  const [viewR, setViewR] = useState<Rev | null>(null)
  const [editR, setEditR] = useState<Rev | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [deleteR, setDeleteR] = useState<Rev | null>(null)
  const [deleting, setDeleting] = useState(false)

  const pkgTitle = (id: string) =>
    (packages as { id: string; title: string }[]).find((p) => p.id === id)?.title ?? id
  const userLabel = (id: string) => {
    const u = (users as { id: string; firstName: string; lastName: string }[]).find(
      (x) => x.id === id,
    )
    return u ? `${u.firstName} ${u.lastName}`.trim() : id.slice(0, 8)
  }

  const list = pendingOnly
    ? (data as Rev[]).filter((r) => r.status === 'pending')
    : (data as Rev[])

  const update = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Pick<Rev, 'status' | 'featured' | 'rating' | 'comment'>>
    }) => {
      await api.patch(`/api/reviews/${id}`, patch)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['bootstrap'] })
      toast.success('Review updated')
    },
    onError: handleServerError,
  })

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editR) return
    setEditSaving(true)
    try {
      await api.patch(`/api/reviews/${editR.id}`, {
        rating: editR.rating,
        comment: editR.comment,
        status: editR.status,
        featured: editR.featured,
      })
      toast.success('Review saved')
      setEditR(null)
      await qc.invalidateQueries({ queryKey: ['reviews'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setEditSaving(false)
    }
  }

  const doDelete = async () => {
    if (!deleteR) return
    setDeleting(true)
    try {
      await api.delete(`/api/reviews/${deleteR.id}`)
      toast.success('Review deleted')
      setDeleteR(null)
      await qc.invalidateQueries({ queryKey: ['reviews'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <TourismAdminShell
      title={pendingOnly ? 'Reviews pending approval' : 'All reviews'}
      description='Approve reviews before they appear on the public site.'
      actions={
        <Button variant='outline' size='sm' onClick={() => void refetch()}>
          <RefreshCw className='me-1 size-4' />
          Refresh
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>Star rating and moderation status.</CardDescription>
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          {isPending ? (
            <p className='text-muted-foreground text-sm'>Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{'★'.repeat(Math.min(5, r.rating))}</TableCell>
                    <TableCell className='max-w-md truncate'>{r.comment}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{r.status}</Badge>
                    </TableCell>
                    <TableCell>{r.featured ? 'Yes' : 'No'}</TableCell>
                    <TableCell className='text-right'>
                      <ResourceRowActions
                        onView={() => setViewR(r)}
                        onEdit={() => setEditR({ ...r })}
                        onDelete={() => setDeleteR(r)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewR} onOpenChange={(o) => !o && setViewR(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Review</DialogTitle>
            <DialogDescription>{viewR?.id}</DialogDescription>
          </DialogHeader>
          {viewR ? (
            <div className='space-y-3 text-sm'>
              <p>
                {'★'.repeat(Math.min(5, viewR.rating))} ({viewR.rating}/5)
              </p>
              <p>
                <span className='text-muted-foreground'>User:</span> {userLabel(viewR.userId)}
              </p>
              <p>
                <span className='text-muted-foreground'>Package:</span> {pkgTitle(viewR.packageId)}
              </p>
              <div className='rounded-md border p-3'>
                <p className='text-muted-foreground text-xs'>Comment</p>
                <p className='mt-1 whitespace-pre-wrap'>{viewR.comment}</p>
              </div>
              <p>
                <span className='text-muted-foreground'>Status:</span> {viewR.status} · Featured:{' '}
                {viewR.featured ? 'Yes' : 'No'}
              </p>
              <p className='text-muted-foreground text-xs'>
                {new Date(viewR.createdAt).toLocaleString()}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editR} onOpenChange={(o) => !o && setEditR(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit review</DialogTitle>
          </DialogHeader>
          {editR ? (
            <form onSubmit={saveEdit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='rr'>Rating (1–5)</Label>
                <Input
                  id='rr'
                  type='number'
                  min={1}
                  max={5}
                  value={editR.rating}
                  onChange={(e) =>
                    setEditR({ ...editR, rating: Math.min(5, Math.max(1, Number(e.target.value) || 1)) })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='rc'>Comment</Label>
                <Textarea
                  id='rc'
                  value={editR.comment}
                  onChange={(e) => setEditR({ ...editR, comment: e.target.value })}
                  rows={5}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='rs'>Status</Label>
                <select
                  id='rs'
                  className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                  value={editR.status}
                  onChange={(e) => setEditR({ ...editR, status: e.target.value })}
                >
                  <option value='pending'>pending</option>
                  <option value='approved'>approved</option>
                  <option value='rejected'>rejected</option>
                </select>
              </div>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  checked={editR.featured}
                  onChange={(e) => setEditR({ ...editR, featured: e.target.checked })}
                />
                Featured
              </label>
              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() =>
                    update.mutate({ id: editR.id, patch: { status: 'approved' } })
                  }
                >
                  Approve
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() =>
                    update.mutate({ id: editR.id, patch: { status: 'rejected' } })
                  }
                >
                  Reject
                </Button>
              </div>
              <Button type='submit' disabled={editSaving}>
                {editSaving ? 'Saving…' : 'Save'}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteR}
        onOpenChange={(o) => !o && setDeleteR(null)}
        title='Delete review?'
        desc={<span>Remove this review permanently.</span>}
        destructive
        isLoading={deleting}
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        handleConfirm={() => void doDelete()}
      />
    </TourismAdminShell>
  )
}
