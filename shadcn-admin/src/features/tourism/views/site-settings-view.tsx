import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TourismAdminShell } from '../components/tourism-admin-shell'
import { useSiteSettingsQuery } from '../hooks/use-tourism-queries'

export function TourismSiteSettingsPage({
  section,
}: {
  section: 'content' | 'seo' | 'social'
}) {
  const qc = useQueryClient()
  const { data = {}, isPending, refetch } = useSiteSettingsQuery()
  const [pending, setPending] = useState(false)

  const settings = data as Record<string, unknown>

  const merge = async (patch: Record<string, unknown>) => {
    setPending(true)
    try {
      await api.patch('/api/site-settings', patch)
      toast.success('Settings saved')
      await qc.invalidateQueries({ queryKey: ['site-settings'] })
      await qc.invalidateQueries({ queryKey: ['bootstrap'] })
    } catch (e) {
      handleServerError(e)
    } finally {
      setPending(false)
    }
  }

  const title =
    section === 'seo'
      ? 'SEO settings'
      : section === 'social'
        ? 'Social links'
        : 'Website content'

  return (
    <TourismAdminShell
      title={title}
      description='Stored as JSON in `site_settings`. Public site reads the same API.'
      actions={
        <Button variant='outline' size='sm' onClick={() => void refetch()}>
          <RefreshCw className='me-1 size-4' />
          Reload
        </Button>
      }
    >
      {isPending ? (
        <p className='text-muted-foreground text-sm'>Loading…</p>
      ) : section === 'content' ? (
        <Card className='max-w-xl'>
          <CardHeader>
            <CardTitle>Homepage & general copy</CardTitle>
            <CardDescription>Key/value fields merged into site payload.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContentForm
              initial={{
                heroTitle: String(settings.heroTitle ?? ''),
                heroSubtitle: String(settings.heroSubtitle ?? ''),
                logoUrl: String(settings.logoUrl ?? ''),
                contactEmail: String(settings.contactEmail ?? ''),
              }}
              onSave={(v) => merge(v)}
              pending={pending}
            />
          </CardContent>
        </Card>
      ) : section === 'seo' ? (
        <Card className='max-w-xl'>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
          </CardHeader>
          <CardContent>
            <SeoForm
              initial={{
                metaTitle: String(settings.metaTitle ?? ''),
                metaDescription: String(settings.metaDescription ?? ''),
              }}
              onSave={(v) => merge(v)}
              pending={pending}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className='max-w-xl'>
          <CardHeader>
            <CardTitle>Social</CardTitle>
          </CardHeader>
          <CardContent>
            <SocialForm
              initial={{
                facebook: String(settings.facebook ?? ''),
                instagram: String(settings.instagram ?? ''),
                twitter: String(settings.twitter ?? ''),
              }}
              onSave={(v) => merge(v)}
              pending={pending}
            />
          </CardContent>
        </Card>
      )}
    </TourismAdminShell>
  )
}

function ContentForm({
  initial,
  onSave,
  pending,
}: {
  initial: {
    heroTitle: string
    heroSubtitle: string
    logoUrl: string
    contactEmail: string
  }
  onSave: (v: Record<string, string>) => void
  pending: boolean
}) {
  const [heroTitle, setHeroTitle] = useState(initial.heroTitle)
  const [heroSubtitle, setHeroSubtitle] = useState(initial.heroSubtitle)
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl)
  const [contactEmail, setContactEmail] = useState(initial.contactEmail)
  return (
    <form
      className='space-y-4'
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ heroTitle, heroSubtitle, logoUrl, contactEmail })
      }}
    >
      <div className='space-y-2'>
        <Label>Hero title</Label>
        <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
      </div>
      <div className='space-y-2'>
        <Label>Hero subtitle</Label>
        <Textarea
          value={heroSubtitle}
          onChange={(e) => setHeroSubtitle(e.target.value)}
        />
      </div>
      <div className='space-y-2'>
        <Label>Logo URL</Label>
        <Input
          placeholder='https://…/logo.png'
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
        />
        {logoUrl ? (
          <div className='bg-muted/30 w-fit rounded-md border p-2'>
            <img
              src={logoUrl}
              alt='Logo preview'
              className='h-10 max-w-[220px] object-contain'
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        ) : null}
      </div>
      <div className='space-y-2'>
        <Label>Contact email (display)</Label>
        <Input
          type='email'
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
        />
      </div>
      <Button type='submit' disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </Button>
    </form>
  )
}

function SeoForm({
  initial,
  onSave,
  pending,
}: {
  initial: { metaTitle: string; metaDescription: string }
  onSave: (v: Record<string, string>) => void
  pending: boolean
}) {
  const [metaTitle, setMetaTitle] = useState(initial.metaTitle)
  const [metaDescription, setMetaDescription] = useState(initial.metaDescription)
  return (
    <form
      className='space-y-4'
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ metaTitle, metaDescription })
      }}
    >
      <div className='space-y-2'>
        <Label>Meta title</Label>
        <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
      </div>
      <div className='space-y-2'>
        <Label>Meta description</Label>
        <Textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
        />
      </div>
      <Button type='submit' disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </Button>
    </form>
  )
}

function SocialForm({
  initial,
  onSave,
  pending,
}: {
  initial: { facebook: string; instagram: string; twitter: string }
  onSave: (v: Record<string, string>) => void
  pending: boolean
}) {
  const [facebook, setFacebook] = useState(initial.facebook)
  const [instagram, setInstagram] = useState(initial.instagram)
  const [twitter, setTwitter] = useState(initial.twitter)
  return (
    <form
      className='space-y-4'
      onSubmit={(e) => {
        e.preventDefault()
        onSave({ facebook, instagram, twitter })
      }}
    >
      <div className='space-y-2'>
        <Label>Facebook URL</Label>
        <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} />
      </div>
      <div className='space-y-2'>
        <Label>Instagram URL</Label>
        <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} />
      </div>
      <div className='space-y-2'>
        <Label>X / Twitter URL</Label>
        <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} />
      </div>
      <Button type='submit' disabled={pending}>
        {pending ? 'Saving…' : 'Save'}
      </Button>
    </form>
  )
}
