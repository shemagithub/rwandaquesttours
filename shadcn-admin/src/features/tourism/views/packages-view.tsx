import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
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
import { TourismAdminShell } from '../components/tourism-admin-shell'
import {
  useDestinationsQuery,
  usePackageCategoriesQuery,
  useTourPackagesQuery,
} from '../hooks/use-tourism-queries'

type Pkg = {
  id: string
  title: string
  slug: string
  priceRwf: number
  durationDays: number
  description: string
  status: string
  itinerary: { day: number; title: string; description: string }[]
  imageUrls?: string[]
  categoryId?: string
  destinationIds?: string[]
}

type Cat = { id: string; name: string; slug: string }

export function TourismPackagesPage({
  variant,
}: {
  variant: 'list' | 'new' | 'categories' | 'itineraries'
}) {
  if (variant === 'new') return <PackageNewPage />
  if (variant === 'categories') return <PackageCategoriesPage />
  if (variant === 'itineraries') return <PackageItinerariesPage />
  return <PackageListPage />
}

function PackageListPage() {
  const qc = useQueryClient()
  const { data = [], isPending, refetch } = useTourPackagesQuery()
  const { data: categories = [] } = usePackageCategoriesQuery()
  const { data: destinations = [] } = useDestinationsQuery()

  const [viewPkg, setViewPkg] = useState<Pkg | null>(null)
  const [editPkg, setEditPkg] = useState<Pkg | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [deletePkg, setDeletePkg] = useState<Pkg | null>(null)
  const [deleting, setDeleting] = useState(false)

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPkg) return
    if (!(editPkg.imageUrls?.length ?? 0))
      return toast.error('Add at least 1 image')
    setEditSaving(true)
    try {
      await api.patch(`/api/tour-packages/${editPkg.id}`, {
        title: editPkg.title,
        slug: editPkg.slug,
        priceRwf: editPkg.priceRwf,
        durationDays: editPkg.durationDays,
        description: editPkg.description,
        status: editPkg.status,
        categoryId: editPkg.categoryId || undefined,
        imageUrls: editPkg.imageUrls ?? [],
        destinationIds: editPkg.destinationIds ?? [],
      })
      toast.success('Package updated')
      setEditPkg(null)
      await qc.invalidateQueries({ queryKey: ['tour-packages'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setEditSaving(false)
    }
  }

  const doDelete = async () => {
    if (!deletePkg) return
    setDeleting(true)
    try {
      await api.delete(`/api/tour-packages/${deletePkg.id}`)
      toast.success('Package deleted')
      setDeletePkg(null)
      await qc.invalidateQueries({ queryKey: ['tour-packages'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <TourismAdminShell
      title='Tour packages'
      description='Manage safari and tour products. Changes sync to your public site when wired.'
      actions={
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' size='sm' onClick={() => void refetch()}>
            <RefreshCw className='me-1 size-4' />
            Refresh
          </Button>
          <Button size='sm' asChild>
            <Link to='/tour-packages/new'>
              <Plus className='me-1 size-4' />
              Add package
            </Link>
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>All packages</CardTitle>
          <CardDescription>
            Price in Rwf, duration in days, itinerary stored per package.
          </CardDescription>
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          {isPending ? (
            <p className='text-muted-foreground text-sm'>Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Price (Rwf)</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data as Pkg[]).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className='font-medium'>{p.title}</TableCell>
                    <TableCell>{p.priceRwf?.toLocaleString?.() ?? p.priceRwf}</TableCell>
                    <TableCell>{p.durationDays}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{p.status}</Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <ResourceRowActions
                        onView={() => setViewPkg(p)}
                        onEdit={() => setEditPkg({ ...p, imageUrls: p.imageUrls ?? [] })}
                        onDelete={() => setDeletePkg(p)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewPkg} onOpenChange={(o) => !o && setViewPkg(null)}>
        <DialogContent className='sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{viewPkg?.title}</DialogTitle>
            <DialogDescription>
              {viewPkg ? (
                <span className='text-muted-foreground font-mono text-xs'>{viewPkg.slug}</span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {viewPkg ? (
            <div className='space-y-3 text-sm'>
              <p>
                <span className='text-muted-foreground'>Price:</span>{' '}
                {viewPkg.priceRwf?.toLocaleString()} Rwf · {viewPkg.durationDays} day(s)
              </p>
              <p>
                <span className='text-muted-foreground'>Status:</span> {viewPkg.status}
              </p>
              <div className='rounded-md border p-3'>
                <p className='text-muted-foreground text-xs'>Description</p>
                <p className='mt-1 whitespace-pre-wrap'>{viewPkg.description || '—'}</p>
              </div>
              <p className='text-muted-foreground text-xs'>ID: {viewPkg.id}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editPkg} onOpenChange={(o) => !o && setEditPkg(null)}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Edit package</DialogTitle>
          </DialogHeader>
          {editPkg ? (
            <form onSubmit={saveEdit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='pt'>Title</Label>
                <Input
                  id='pt'
                  value={editPkg.title}
                  onChange={(e) => setEditPkg({ ...editPkg, title: e.target.value })}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='ps'>Slug</Label>
                <Input
                  id='ps'
                  value={editPkg.slug}
                  onChange={(e) => setEditPkg({ ...editPkg, slug: e.target.value })}
                />
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='pp'>Price (Rwf)</Label>
                  <Input
                    id='pp'
                    type='number'
                    min={0}
                    value={editPkg.priceRwf}
                    onChange={(e) =>
                      setEditPkg({ ...editPkg, priceRwf: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='pd'>Duration (days)</Label>
                  <Input
                    id='pd'
                    type='number'
                    min={1}
                    value={editPkg.durationDays}
                    onChange={(e) =>
                      setEditPkg({ ...editPkg, durationDays: Number(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='pst'>Status</Label>
                <select
                  id='pst'
                  className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                  value={editPkg.status}
                  onChange={(e) => setEditPkg({ ...editPkg, status: e.target.value })}
                >
                  <option value='active'>active</option>
                  <option value='inactive'>inactive</option>
                </select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='pcat'>Category</Label>
                <select
                  id='pcat'
                  className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                  value={editPkg.categoryId ?? ''}
                  onChange={(e) => setEditPkg({ ...editPkg, categoryId: e.target.value })}
                >
                  <option value=''>— None —</option>
                  {(categories as Cat[]).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='space-y-2'>
                <Label>Linked destinations</Label>
                <div className='bg-muted/40 max-h-36 space-y-2 overflow-y-auto rounded-md border p-2'>
                  {(destinations as { id: string; name: string }[]).map((d) => (
                    <label key={d.id} className='flex items-center gap-2 text-sm'>
                      <input
                        type='checkbox'
                        checked={(editPkg.destinationIds ?? []).includes(d.id)}
                        onChange={(e) => {
                          const set = new Set(editPkg.destinationIds ?? [])
                          if (e.target.checked) set.add(d.id)
                          else set.delete(d.id)
                          setEditPkg({
                            ...editPkg,
                            destinationIds: [...set],
                          })
                        }}
                      />
                      {d.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='pdesc'>Description</Label>
                <Textarea
                  id='pdesc'
                  value={editPkg.description}
                  onChange={(e) => setEditPkg({ ...editPkg, description: e.target.value })}
                  rows={4}
                />
              </div>
              <ImagesUploader
                label='Package images'
                value={editPkg.imageUrls ?? []}
                onChange={(urls) => setEditPkg({ ...editPkg, imageUrls: urls })}
                required
              />
              <Button type='submit' disabled={editSaving}>
                {editSaving ? 'Saving…' : 'Save'}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletePkg}
        onOpenChange={(o) => (o ? null : setDeletePkg(null))}
        title='Delete tour package?'
        desc={<span>This removes the package and its itinerary links.</span>}
        destructive
        isLoading={deleting}
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        handleConfirm={() => void doDelete()}
      />
    </TourismAdminShell>
  )
}

function PackageNewPage() {
  const qc = useQueryClient()
  const { data: categories = [] } = usePackageCategoriesQuery()
  const [title, setTitle] = useState('')
  const [priceRwf, setPriceRwf] = useState('')
  const [durationDays, setDurationDays] = useState('3')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrls.length) return toast.error('Add at least 1 image')
    setPending(true)
    try {
      await api.post('/api/tour-packages', {
        title,
        priceRwf: Number(priceRwf) || 0,
        durationDays: Number(durationDays) || 1,
        description,
        categoryId: categoryId || undefined,
        imageUrls,
        itinerary: [
          {
            day: 1,
            title: 'Arrival',
            description: 'Welcome and briefing.',
          },
        ],
        destinationIds: [],
        status: 'active',
      })
      toast.success('Package created')
      await qc.invalidateQueries({ queryKey: ['tour-packages'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
      setTitle('')
      setPriceRwf('')
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
      title='Add package'
      description='Create a new bookable tour. Add detailed itinerary from the package editor later if needed.'
      actions={
        <Button variant='outline' size='sm' asChild>
          <Link to='/tour-packages'>Back to list</Link>
        </Button>
      }
    >
      <Card className='max-w-xl'>
        <CardHeader>
          <CardTitle>New package</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='price'>Price (Rwf)</Label>
                <Input
                  id='price'
                  type='number'
                  min={0}
                  value={priceRwf}
                  onChange={(e) => setPriceRwf(e.target.value)}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='days'>Duration (days)</Label>
                <Input
                  id='days'
                  type='number'
                  min={1}
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='cat'>Category</Label>
              <select
                id='cat'
                className='border-input bg-background w-full rounded-md border px-3 py-2 text-sm'
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value=''>— None —</option>
                {(categories as Cat[]).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
              label='Package images'
              value={imageUrls}
              onChange={setImageUrls}
              required
            />
            <Button type='submit' disabled={pending}>
              {pending ? 'Saving…' : 'Create package'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </TourismAdminShell>
  )
}

function PackageCategoriesPage() {
  const qc = useQueryClient()
  const { data = [], isPending, refetch } = usePackageCategoriesQuery()
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)
  const [viewCat, setViewCat] = useState<Cat | null>(null)
  const [editCat, setEditCat] = useState<Cat | null>(null)
  const [editCatSaving, setEditCatSaving] = useState(false)
  const [deleteCat, setDeleteCat] = useState<Cat | null>(null)
  const [deletingCat, setDeletingCat] = useState(false)

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setPending(true)
    try {
      await api.post('/api/package-categories', { name: name.trim() })
      toast.success('Category added')
      setName('')
      await qc.invalidateQueries({ queryKey: ['package-categories'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setPending(false)
    }
  }

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editCat?.name.trim()) return
    setEditCatSaving(true)
    try {
      await api.patch(`/api/package-categories/${editCat.id}`, { name: editCat.name.trim() })
      toast.success('Category updated')
      setEditCat(null)
      await qc.invalidateQueries({ queryKey: ['package-categories'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setEditCatSaving(false)
    }
  }

  const doDeleteCategory = async () => {
    if (!deleteCat) return
    setDeletingCat(true)
    try {
      await api.delete(`/api/package-categories/${deleteCat.id}`)
      toast.success('Category deleted')
      setDeleteCat(null)
      await qc.invalidateQueries({ queryKey: ['package-categories'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (err) {
      handleServerError(err)
    } finally {
      setDeletingCat(false)
    }
  }

  return (
    <TourismAdminShell
      title='Package categories'
      description='Group packages for browsing on the website.'
      actions={
        <Button variant='outline' size='sm' onClick={() => void refetch()}>
          <RefreshCw className='me-1 size-4' />
          Refresh
        </Button>
      }
    >
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Add category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={add} className='flex flex-wrap items-end gap-2'>
            <Input
              placeholder='Category name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='max-w-xs'
            />
            <Button type='submit' disabled={pending}>
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className='pt-6'>
          {isPending ? (
            <p className='text-muted-foreground text-sm'>Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data as Cat[]).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className='text-muted-foreground'>{c.slug}</TableCell>
                    <TableCell className='text-right'>
                      <ResourceRowActions
                        onView={() => setViewCat(c)}
                        onEdit={() => setEditCat({ ...c })}
                        onDelete={() => setDeleteCat(c)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewCat} onOpenChange={(o) => !o && setViewCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewCat?.name}</DialogTitle>
            <DialogDescription>Package category</DialogDescription>
          </DialogHeader>
          {viewCat ? (
            <div className='space-y-2 text-sm'>
              <p>
                <span className='text-muted-foreground'>Slug:</span> {viewCat.slug}
              </p>
              <p className='font-mono text-xs'>{viewCat.id}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCat} onOpenChange={(o) => !o && setEditCat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          {editCat ? (
            <form onSubmit={saveCategory} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='pcn'>Name</Label>
                <Input
                  id='pcn'
                  value={editCat.name}
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  required
                />
              </div>
              <Button type='submit' disabled={editCatSaving}>
                {editCatSaving ? 'Saving…' : 'Save'}
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteCat}
        onOpenChange={(o) => (o ? null : setDeleteCat(null))}
        title='Delete category?'
        desc={<span>Remove {deleteCat?.name}? Packages using it may need reassignment.</span>}
        destructive
        isLoading={deletingCat}
        confirmText={deletingCat ? 'Deleting…' : 'Delete'}
        handleConfirm={() => void doDeleteCategory()}
      />
    </TourismAdminShell>
  )
}

function PackageItinerariesPage() {
  const { data = [], isPending, refetch } = useTourPackagesQuery()

  return (
    <TourismAdminShell
      title='Itineraries'
      description='Day-by-day plans attached to each package. Edit full detail via API or future package editor.'
      actions={
        <Button variant='outline' size='sm' onClick={() => void refetch()}>
          <RefreshCw className='me-1 size-4' />
          Refresh
        </Button>
      }
    >
      <Card>
        <CardContent className='pt-6'>
          {isPending ? (
            <p className='text-muted-foreground text-sm'>Loading…</p>
          ) : (
            <div className='space-y-6'>
              {(data as Pkg[]).map((p) => (
                <div key={p.id} className='rounded-lg border p-4'>
                  <h3 className='mb-2 font-semibold'>{p.title}</h3>
                  <ul className='text-muted-foreground list-inside list-decimal space-y-1 text-sm'>
                    {(p.itinerary ?? []).map((d) => (
                      <li key={d.day}>
                        <span className='text-foreground font-medium'>
                          Day {d.day}: {d.title}
                        </span>{' '}
                        — {d.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TourismAdminShell>
  )
}
