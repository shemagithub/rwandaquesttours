import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/shared/image-uploader'
import { TourismAdminShell } from '../components/tourism-admin-shell'

type VehicleDto = {
  id: string
  slug: string
  title: string
  badge: string
  blurb: string
  dailyPriceUsd: number
  imageUrl: string
  specs: { icon?: string; text?: string }[]
  active: boolean
  sortOrder: number
}

export function TourismCarRentalVehicleFormPage({
  vehicleId,
}: {
  vehicleId?: string
}) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const isEdit = Boolean(vehicleId)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [badge, setBadge] = useState('')
  const [blurb, setBlurb] = useState('')
  const [dailyPriceUsd, setDailyPriceUsd] = useState(35)
  const [imageUrl, setImageUrl] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [active, setActive] = useState(true)
  const [specsText, setSpecsText] = useState(
    '[\n  { "icon": "bi-people", "text": "4 seats" },\n  { "icon": "bi-suitcase2", "text": "2 bags" }\n]',
  )

  useEffect(() => {
    if (!vehicleId) return
    let cancel = false
    setLoading(true)
    void api
      .get('/api/car-rental-vehicles')
      .then(({ data }) => {
        const v = (data as VehicleDto[]).find((x) => x.id === vehicleId)
        if (cancel || !v) throw new Error('not found')
        setSlug(v.slug)
        setTitle(v.title)
        setBadge(v.badge ?? '')
        setBlurb(v.blurb ?? '')
        setDailyPriceUsd(Number(v.dailyPriceUsd ?? 0))
        setImageUrl(v.imageUrl ?? '')
        setSortOrder(Number(v.sortOrder ?? 0))
        setActive(!!v.active)
        setSpecsText(JSON.stringify(v.specs ?? [], null, 2))
      })
      .catch((e) => {
        handleServerError(e)
        void navigate({ to: '/car-rental/vehicles', replace: true })
      })
      .finally(() => {
        if (!cancel) setLoading(false)
      })
    return () => {
      cancel = true
    }
  }, [vehicleId, navigate])

  const parseSpecs = (): { icon: string; text: string }[] | null => {
    try {
      const j = JSON.parse(specsText) as unknown
      if (!Array.isArray(j)) {
        toast.error('Specs must be a JSON array')
        return null
      }
      return j.map((x) => ({
        icon: String((x as { icon?: unknown })?.icon ?? 'bi-circle'),
        text: String((x as { text?: unknown })?.text ?? ''),
      }))
    } catch {
      toast.error('Invalid JSON for specs')
      return null
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const specs = parseSpecs()
    if (!specs) return

    const payload = {
      slug,
      title,
      badge,
      blurb,
      dailyPriceUsd,
      imageUrl,
      specs,
      active,
      sortOrder,
    }

    setSaving(true)
    try {
      if (isEdit && vehicleId) {
        await api.patch(`/api/car-rental-vehicles/${vehicleId}`, payload)
        toast.success('Vehicle saved')
      } else {
        await api.post('/api/car-rental-vehicles', payload)
        toast.success('Vehicle created')
      }
      await qc.invalidateQueries({ queryKey: ['car-rental-vehicles'] })
      await qc.invalidateQueries({ queryKey: ['car-rental-vehicles-summary'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
      void navigate({ to: '/car-rental/vehicles', replace: true })
    } catch (err) {
      handleServerError(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <TourismAdminShell title='Loading…'>
        <p className='text-muted-foreground flex items-center gap-2 text-sm'>
          <Loader2 className='size-4 animate-spin' /> Loading vehicle…
        </p>
      </TourismAdminShell>
    )
  }

  return (
    <TourismAdminShell
      title={isEdit ? 'Edit vehicle' : 'Add vehicle'}
      description='Fleet appears on the public site when “Visible on catalog” is checked.'
      actions={
        <Button variant='outline' size='sm' asChild>
          <Link to='/car-rental/vehicles'>Back to fleet</Link>
        </Button>
      }
    >
      <Card className='max-w-3xl'>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Upload a photo or paste a URL. Uploaded files go to{' '}
            <code className='text-xs'>/uploads/...</code>
            {' '}
            on the API. Slugs must match booking “vehicle class” codes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void onSubmit(e)} className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='slug'>Slug *</Label>
                <Input
                  id='slug'
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder='economy'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='sortOrder'>Sort order</Label>
                <Input
                  id='sortOrder'
                  type='number'
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value || 0))}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title *</Label>
              <Input
                id='title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='badge'>Badge</Label>
              <Input
                id='badge'
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder='City & airport'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='blurb'>Blurb</Label>
              <Textarea
                id='blurb'
                rows={3}
                value={blurb}
                onChange={(e) => setBlurb(e.target.value)}
              />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='usd'>Daily from (USD)</Label>
                <Input
                  id='usd'
                  type='number'
                  min={0}
                  step='0.01'
                  value={dailyPriceUsd}
                  onChange={(e) => setDailyPriceUsd(Number(e.target.value || 0))}
                />
              </div>
              <div className='flex items-end gap-2 pb-2'>
                <Checkbox
                  id='active'
                  checked={active}
                  onCheckedChange={(c) => setActive(c === true)}
                />
                <Label htmlFor='active' className='font-normal'>
                  Visible on catalog
                </Label>
              </div>
            </div>
            <ImageUploader
              label='Vehicle image'
              value={imageUrl}
              onChange={setImageUrl}
            />
            <div className='space-y-2'>
              <Label htmlFor='fleet-specs-json'>Specs (JSON array)</Label>
              <Textarea
                id='fleet-specs-json'
                rows={10}
                className='font-mono text-xs'
                value={specsText}
                onChange={(e) => setSpecsText(e.target.value)}
              />
              <p className='text-muted-foreground text-xs'>
                Use Bootstrap Icons short names (e.g.{' '}
                <code className='text-[11px]'>bi-people</code>) — the travel site renders{' '}
                <code className='text-[11px]'>bi bi-people</code>.
              </p>
            </div>

            <div className='flex gap-2 pt-2'>
              <Button type='submit' disabled={saving}>
                {saving ? <Loader2 className='size-4 animate-spin' /> : null}{' '}
                {isEdit ? 'Save changes' : 'Create vehicle'}
              </Button>
              <Button type='button' variant='outline' asChild>
                <Link to='/car-rental/vehicles'>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TourismAdminShell>
  )
}
