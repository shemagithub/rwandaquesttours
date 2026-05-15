import { useEffect, useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, ImageIcon, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { resolveAssetUrl } from '@/lib/asset-url'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TourismAdminShell } from '../components/tourism-admin-shell'
import {
  type CarRentalVehicleListParams,
  useCarRentalVehiclesQuery,
  useCarRentalVehiclesSummaryQuery,
} from '../hooks/use-tourism-queries'

type Vehicle = {
  id: string
  slug: string
  title: string
  badge: string
  blurb: string
  dailyPriceUsd: number
  specs: { icon?: string; text?: string }[]
  imageUrl: string
  active: boolean
  sortOrder: number
}

type FleetTab = 'all' | 'active' | 'inactive'

export function TourismCarRentalVehiclesPage() {
  const qc = useQueryClient()
  const { data: summary } = useCarRentalVehiclesSummaryQuery()

  const [fleetTab, setFleetTab] = useState<FleetTab>('all')
  const [qInput, setQInput] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(qInput.trim()), 320)
    return () => window.clearTimeout(t)
  }, [qInput])

  const listParams: CarRentalVehicleListParams = useMemo(() => {
    const p: CarRentalVehicleListParams = {}
    if (fleetTab === 'active') p.active = 'true'
    if (fleetTab === 'inactive') p.active = 'false'
    if (debouncedQ) p.q = debouncedQ
    return p
  }, [fleetTab, debouncedQ])

  const { data = [], isPending, refetch, isFetching } = useCarRentalVehiclesQuery(listParams)
  const [deleteV, setDeleteV] = useState<Vehicle | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState<Vehicle | null>(null)

  const rows = useMemo(() => [...(data as Vehicle[])], [data])

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await api.patch(`/api/car-rental-vehicles/${id}`, { active })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['car-rental-vehicles'] })
      qc.invalidateQueries({ queryKey: ['car-rental-vehicles-summary'] })
      qc.invalidateQueries({ queryKey: ['bootstrap'] })
      toast.success('Vehicle updated')
    },
    onError: handleServerError,
  })

  const duplicate = useMutation({
    mutationFn: async (id: string) => {
      const { data: created } = await api.post<Vehicle>(
        `/api/car-rental-vehicles/${id}/duplicate`,
      )
      return created
    },
    onSuccess: () => {
      toast.success('Duplicated — copy is inactive. Edit slug & title before publishing.')
      void qc.invalidateQueries({ queryKey: ['car-rental-vehicles'] })
      void qc.invalidateQueries({ queryKey: ['car-rental-vehicles-summary'] })
      void qc.invalidateQueries({ queryKey: ['bootstrap'] })
    },
    onError: handleServerError,
  })

  const doDelete = async () => {
    if (!deleteV) return
    setDeleting(true)
    try {
      await api.delete(`/api/car-rental-vehicles/${deleteV.id}`)
      toast.success('Vehicle removed')
      setDeleteV(null)
      await qc.invalidateQueries({ queryKey: ['car-rental-vehicles'] })
      await qc.invalidateQueries({ queryKey: ['car-rental-vehicles-summary'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (e) {
      handleServerError(e)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <TourismAdminShell
      title='Fleet vehicles'
      description='Vehicles shown on the public Car Rental page and offered in booking requests.'
      actions={
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' size='sm' onClick={() => void refetch()}>
            <RefreshCw className={`me-1 size-4${isFetching ? ' animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant='outline' size='sm' asChild>
            <Link to='/car-rental'>Quote requests</Link>
          </Button>
          <Button size='sm' asChild>
            <Link to='/car-rental/vehicles/new'>
              <Plus className='me-1 size-4' />
              Add vehicle
            </Link>
          </Button>
        </div>
      }
    >
      {summary ? (
        <div className='mb-4 grid gap-3 sm:grid-cols-3'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Total</CardTitle>
            </CardHeader>
            <CardContent className='text-2xl font-semibold tabular-nums'>
              {summary.total}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Active (public)</CardTitle>
            </CardHeader>
            <CardContent className='text-2xl font-semibold tabular-nums'>
              {summary.active}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Hidden</CardTitle>
            </CardHeader>
            <CardContent className='text-2xl font-semibold tabular-nums'>
              {summary.inactive}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Slug ties to quotes from the site (vehicle class codes). Duplicate creates an inactive copy
            with a new slug suffix.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Tabs
            value={fleetTab}
            onValueChange={(v) => setFleetTab(v as FleetTab)}
            className='gap-4'
          >
            <TabsList className='grid h-auto w-full max-w-xl grid-cols-3'>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='active'>Live</TabsTrigger>
              <TabsTrigger value='inactive'>Hidden</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className='max-w-md space-y-2'>
            <Label htmlFor='fleet-q'>Search</Label>
            <Input
              id='fleet-q'
              placeholder='Title, slug, badge, blurb…'
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
            />
          </div>

          {isPending ? (
            <p className='text-muted-foreground text-sm'>Loading…</p>
          ) : rows.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              No vehicles in this view — try another tab or clear search, or{' '}
              <Link className='text-primary underline underline-offset-4' to='/car-rental/vehicles/new'>
                add one
              </Link>
              .
            </p>
          ) : (
            <div className='divide-y rounded-md border'>
              {rows.map((v) => {
                const src = resolveAssetUrl(v.imageUrl)
                return (
                  <div
                    key={v.id}
                    className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center'
                  >
                    <button
                      type='button'
                      className='bg-muted relative h-20 w-full shrink-0 overflow-hidden rounded-md sm:h-16 sm:w-24'
                      onClick={() => (src ? setPreview(v) : undefined)}
                      title={src ? 'View image' : undefined}
                    >
                      {src ? (
                        <img alt='' className='h-full w-full object-cover' src={src} />
                      ) : (
                        <div className='text-muted-foreground flex h-full flex-col items-center justify-center gap-0.5 text-xs'>
                          <ImageIcon className='size-4 opacity-50' />
                          No image
                        </div>
                      )}
                    </button>
                    <div className='min-w-0 flex-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='font-semibold'>{v.title}</span>
                        <Badge variant='outline' className='font-mono text-xs'>
                          {v.slug}
                        </Badge>
                        <Badge variant={v.active ? 'default' : 'secondary'}>
                          {v.active ? 'Active' : 'Hidden'}
                        </Badge>
                      </div>
                      <p className='text-muted-foreground truncate text-xs'>{v.badge}</p>
                      <p className='mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400'>
                        from ${v.dailyPriceUsd}/day · sort {v.sortOrder}
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-2 sm:justify-end'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => toggleActive.mutate({ id: v.id, active: !v.active })}
                      >
                        {v.active ? 'Hide' : 'Activate'}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        disabled={duplicate.isPending}
                        onClick={() => duplicate.mutate(v.id)}
                      >
                        <Copy className='me-1 size-4' />
                        Duplicate
                      </Button>
                      <Button variant='outline' size='sm' asChild>
                        <Link
                          to='/car-rental/vehicles/$vehicleId'
                          params={{ vehicleId: v.id }}
                        >
                          <Pencil className='me-1 size-4' />
                          Edit
                        </Link>
                      </Button>
                      <Button variant='destructive' size='sm' onClick={() => setDeleteV(v)}>
                        <Trash2 className='me-1 size-4' />
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
          </DialogHeader>
          {preview && resolveAssetUrl(preview.imageUrl) ? (
            <img
              alt=''
              className='max-h-[70vh] w-full rounded-md object-contain'
              src={resolveAssetUrl(preview.imageUrl)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteV}
        onOpenChange={(o) => !o && setDeleteV(null)}
        title='Delete vehicle?'
        desc={
          deleteV ? (
            <span>
              Remove “{deleteV.title}” ({deleteV.slug}). Existing quote requests keep their saved
              class code.
            </span>
          ) : (
            ''
          )
        }
        destructive
        isLoading={deleting}
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        handleConfirm={() => void doDelete()}
      />
    </TourismAdminShell>
  )
}
