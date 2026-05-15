import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TourismAdminShell } from '../components/tourism-admin-shell'
import { useGalleryQuery } from '../hooks/use-tourism-queries'
import { ImageUploader } from '@/components/shared/image-uploader'
import { resolveAssetUrl } from '@/lib/asset-url'

type Item = {
  id: string
  url: string
  type: string
  category: string
  caption: string
  updatedAt: string
}

export function TourismGalleryPage({ variant }: { variant: 'list' | 'upload' }) {
  if (variant === 'upload') return <GalleryUploadPage />
  return <GalleryListPage />
}

function GalleryListPage() {
  const { data = [], isPending, refetch } = useGalleryQuery()

  return (
    <TourismAdminShell
      title='Media gallery'
      description='Image URLs (CDN or uploads). Video support depends on storage integration.'
      actions={
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={() => void refetch()}>
            <RefreshCw className='me-1 size-4' />
            Refresh
          </Button>
          <Button size='sm' asChild>
            <Link to='/gallery/upload'>
              <Plus className='me-1 size-4' />
              Upload
            </Link>
          </Button>
        </div>
      }
    >
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {isPending ? (
          <p className='text-muted-foreground text-sm'>Loading…</p>
        ) : (
          (data as Item[]).map((g) => (
            <Card key={g.id}>
              <CardContent className='p-2'>
                <div className='bg-muted relative aspect-video overflow-hidden rounded-md'>
                  {g.type === 'image' ? (
                    <img
                      src={resolveAssetUrl(g.url)}
                      alt={g.caption}
                      className='size-full object-cover'
                    />
                  ) : (
                    <div className='text-muted-foreground flex h-full items-center justify-center text-sm'>
                      {g.type}
                    </div>
                  )}
                </div>
                <p className='mt-2 text-sm font-medium'>{g.caption || '—'}</p>
                <p className='text-muted-foreground text-xs'>{g.category}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </TourismAdminShell>
  )
}

function GalleryUploadPage() {
  const qc = useQueryClient()
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('wildlife')
  const [caption, setCaption] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return toast.error('Image is required')
    setPending(true)
    try {
      await api.post('/api/gallery', {
        url: url.trim(),
        type: 'image',
        category,
        caption,
      })
      toast.success('Media item saved')
      await qc.invalidateQueries({ queryKey: ['gallery'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
      setUrl('')
      setCaption('')
    } catch (err) {
      handleServerError(err)
    } finally {
      setPending(false)
    }
  }

  return (
    <TourismAdminShell
      title='Upload media'
      description='Upload an image (drag & drop) or paste a public image URL.'
      actions={
        <Button variant='outline' size='sm' asChild>
          <Link to='/gallery'>Back</Link>
        </Button>
      }
    >
      <Card className='max-w-md'>
        <CardHeader>
          <CardTitle>Add image</CardTitle>
          <CardDescription>Upload a file or use a URL.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className='space-y-4'>
            <ImageUploader label='Image' value={url} onChange={setUrl} required />
            <div className='space-y-2'>
              <Label htmlFor='cat'>Category</Label>
              <Input
                id='cat'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='cap'>Caption</Label>
              <Input
                id='cap'
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <Button type='submit' disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </TourismAdminShell>
  )
}
