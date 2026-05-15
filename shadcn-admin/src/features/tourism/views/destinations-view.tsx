import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Plus, RefreshCw } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { ImagesUploader } from '@/components/shared/image-uploader'
import { ResourceRowActions } from '@/components/shared/resource-row-actions'
import { ConfirmDialog } from '@/components/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { resolveAssetUrl } from '@/lib/asset-url'
import { TourismAdminShell } from '../components/tourism-admin-shell'
import { useDestinationsQuery, useTourPackagesQuery } from '../hooks/use-tourism-queries'

type Dest = {
  id: string
  name: string
  slug: string
  description: string
  imageUrls: string[]
  lat: number
  lng: number
  linkedPackageIds: string[]
}

export function TourismDestinationsPage({ variant }: { variant: 'list' | 'new' }) {
  if (variant === 'new') return <DestinationNewPage />
  return <DestinationListPage />
}

function DestinationListPage() {
  const qc = useQueryClient()
  const { data = [], isPending, refetch } = useDestinationsQuery()
  const { data: packages = [] } = useTourPackagesQuery()

  const [viewDest, setViewDest] = useState<Dest | null>(null)
  const [editDest, setEditDest] = useState<Dest | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [deleteDest, setDeleteDest] = useState<Dest | null>(null)
  const [deleting, setDeleting] = useState(false)

  const pkgTitle = (id: string) =>
    (packages as { id: string; title: string }[]).find((p) => p.id === id)?.title ?? id.slice(0, 8)

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editDest) return
    if (!(editDest.imageUrls?.length ?? 0)) return toast.error('Add at least 1 image')
    setEditSaving(true)
    try {
      await api.patch(`/api/destinations/${editDest.id}`, {
        name: editDest.name,
        slug: editDest.slug,
        description: editDest.description,
        lat: Number(editDest.lat),
        lng: Number(editDest.lng),
        imageUrls: editDest.imageUrls ?? [],
        linkedPackageIds: editDest.linkedPackageIds ?? [],
      })
      toast.success('Destination updated')
      setEditDest(null)
      await qc.invalidateQueries({ queryKey: ['destinations'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setEditSaving(false)
    }
  }

  const doDelete = async () => {
    if (!deleteDest) return
    setDeleting(true)
    try {
      await api.delete(`/api/destinations/${deleteDest.id}`)
      toast.success('Destination deleted')
      setDeleteDest(null)
      await qc.invalidateQueries({ queryKey: ['destinations'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <TourismAdminShell
      title='Destinations'
      description='Parks, lakes, and regions visitors can explore. Link packages to destinations in package editor.'
      actions={
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={() => void refetch()}>
            <RefreshCw className='me-1 size-4' />
            Refresh
          </Button>
          <Button size='sm' asChild>
            <Link to='/destinations/new'>
              <Plus className='me-1 size-4' />
              Add destination
            </Link>
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>All destinations</CardTitle>
          <CardDescription>Name, coordinates, linked packages.</CardDescription>
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          {isPending ? (
            <p className='text-muted-foreground text-sm'>Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Lat / Lng</TableHead>
                  <TableHead>Linked packages</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data as Dest[]).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className='font-medium'>{d.name}</TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {d.lat}, {d.lng}
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary'>
                        {(d.linkedPackageIds ?? []).length} packages
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <ResourceRowActions
                        onView={() => setViewDest(d)}
                        onEdit={() =>
                          setEditDest({
                            ...d,
                            imageUrls: d.imageUrls ?? [],
                            linkedPackageIds: d.linkedPackageIds ?? [],
                          })
                        }
                        onDelete={() => setDeleteDest(d)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewDest} onOpenChange={(o) => !o && setViewDest(null)}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{viewDest?.name}</DialogTitle>
            <DialogDescription>{viewDest?.slug}</DialogDescription>
          </DialogHeader>
          {viewDest ? (
            <div className='space-y-3 text-sm'>
              <p className='text-muted-foreground'>
                {viewDest.lat}, {viewDest.lng}
              </p>
              <div className='rounded-md border p-3'>
                <p className='text-muted-foreground text-xs'>Description</p>
                <p className='mt-1 whitespace-pre-wrap'>{viewDest.description || '—'}</p>
              </div>
              {viewDest.imageUrls?.[0] ? (
                <img
                  src={resolveAssetUrl(viewDest.imageUrls[0])}
                  alt=''
                  className='h-40 w-full rounded-md border object-cover'
                />
              ) : null}
              <p className='text-muted-foreground text-xs'>
                Linked: {(viewDest.linkedPackageIds ?? []).map(pkgTitle).join(', ') || '—'}
              </p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editDest} onOpenChange={(o) => !o && setEditDest(null)}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Edit destination</DialogTitle>
          </DialogHeader>
          {editDest ? (
            <form onSubmit={saveEdit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='dn'>Name</Label>
                <Input
                  id='dn'
                  value={editDest.name}
                  onChange={(e) => setEditDest({ ...editDest, name: e.target.value })}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='ds'>Slug</Label>
                <Input
                  id='ds'
                  value={editDest.slug}
                  onChange={(e) => setEditDest({ ...editDest, slug: e.target.value })}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='dd'>Description</Label>
                <Textarea
                  id='dd'
                  value={editDest.description}
                  onChange={(e) => setEditDest({ ...editDest, description: e.target.value })}
                  rows={4}
                />
              </div>
              <ImagesUploader
                label='Images'
                value={editDest.imageUrls ?? []}
                onChange={(urls) => setEditDest({ ...editDest, imageUrls: urls })}
                required
              />
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='dlat'>Latitude</Label>
                  <Input
                    id='dlat'
                    type='number'
                    step='any'
                    value={editDest.lat}
                    onChange={(e) =>
                      setEditDest({ ...editDest, lat: Number(e.target.value) })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='dlng'>Longitude</Label>
                  <Input
                    id='dlng'
                    type='number'
                    step='any'
                    value={editDest.lng}
                    onChange={(e) =>
                      setEditDest({ ...editDest, lng: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label>Linked packages</Label>
                <div className='bg-muted/40 max-h-36 space-y-2 overflow-y-auto rounded-md border p-2'>
                  {(packages as { id: string; title: string }[]).map((p) => (
                    <label key={p.id} className='flex items-center gap-2 text-sm'>
                      <input
                        type='checkbox'
                        checked={(editDest.linkedPackageIds ?? []).includes(p.id)}
                        onChange={(e) => {
                          const set = new Set(editDest.linkedPackageIds ?? [])
                          if (e.target.checked) set.add(p.id)
                          else set.delete(p.id)
                          setEditDest({ ...editDest, linkedPackageIds: [...set] })
                        }}
                      />
                      {p.title}
                    </label>
                  ))}
                </div>
              </div>
              <Button type='submit' disabled={editSaving}>
                {editSaving ? 'Saving…' : 'Save'}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteDest}
        onOpenChange={(o) => (o ? null : setDeleteDest(null))}
        title='Delete destination?'
        desc={<span>This removes {deleteDest?.name} and its package links.</span>}
        destructive
        isLoading={deleting}
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        handleConfirm={() => void doDelete()}
      />
    </TourismAdminShell>
  )
}

function DestinationNewPage() {
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('-1.94')
  const [lng, setLng] = useState('29.87')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrls.length) return toast.error('Add at least 1 image')
    setPending(true)
    try {
      await api.post('/api/destinations', {
        name,
        description,
        lat: Number(lat),
        lng: Number(lng),
        imageUrls,
        linkedPackageIds: [],
      })
      toast.success('Destination created')
      await qc.invalidateQueries({ queryKey: ['destinations'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
      setName('')
      setDescription('')
      setImageUrls([])
    } catch (err) {
      handleServerError(err)
    } finally {
      setPending(false)
    }
  }

  return (
    <TourismAdminShell
      title='Add destination'
      description='Create a destination. Embed a map on the public site using lat/lng.'
      actions={
        <Button variant='outline' size='sm' asChild>
          <Link to='/destinations'>Back to list</Link>
        </Button>
      }
    >
      <Card className='max-w-xl'>
        <CardHeader>
          <CardTitle>New destination</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='n'>Name</Label>
              <Input
                id='n'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='desc'>Description</Label>
              <Textarea
                id='desc'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <ImagesUploader
              label='Destination images'
              value={imageUrls}
              onChange={setImageUrls}
              required
            />
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='lat'>Latitude</Label>
                <Input
                  id='lat'
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lng'>Longitude</Label>
                <Input
                  id='lng'
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type='submit' disabled={pending}>
              {pending ? 'Saving…' : 'Save destination'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </TourismAdminShell>
  )
}
