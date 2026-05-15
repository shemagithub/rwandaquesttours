import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { useBootstrapQuery } from '@/hooks/use-bootstrap-query'

type BookingRow = {
  id: string
  userId: string
  packageId: string
  startDate: string
  createdAt?: string
  status: string
  totalRwf: number
  guideId: string | null
}

function formatRwf(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const a = parts[0]?.[0] ?? '?'
  const b = parts[1]?.[0] ?? ''
  return (a + b).toUpperCase()
}

export function RecentSales() {
  const { data } = useBootstrapQuery()

  const usersById = useMemo(() => {
    const m = new Map<string, { firstName: string; lastName: string; email: string }>()
    for (const u of (data?.tourismUsers ?? []) as any[]) {
      if (!u?.id) continue
      m.set(String(u.id), {
        firstName: String(u.firstName ?? ''),
        lastName: String(u.lastName ?? ''),
        email: String(u.email ?? ''),
      })
    }
    return m
  }, [data?.tourismUsers])

  const pkgsById = useMemo(() => {
    const m = new Map<string, { title: string }>()
    for (const p of (data?.packages ?? []) as any[]) {
      if (!p?.id) continue
      m.set(String(p.id), { title: String(p.title ?? '') })
    }
    return m
  }, [data?.packages])

  const recent = useMemo(() => {
    const list = ((data?.bookings ?? []) as BookingRow[]).slice()
    const ts = (b: BookingRow) =>
      String(b.createdAt ?? b.startDate ?? '').slice(0, 24)
    list.sort((a, b) => ts(b).localeCompare(ts(a)))
    return list.slice(0, 6)
  }, [data?.bookings])

  return (
    <div className='space-y-6'>
      {recent.length === 0 ? (
        <p className='text-muted-foreground text-sm'>No bookings yet.</p>
      ) : (
        recent.map((b) => {
          const u = usersById.get(String(b.userId))
          const name = u ? `${u.firstName} ${u.lastName}`.trim() : 'Guest'
          const pkg = pkgsById.get(String(b.packageId))?.title || 'Tour package'
          return (
            <div key={b.id} className='flex items-center justify-between gap-3'>
              <div className='flex min-w-0 items-center gap-3'>
                <div className='bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold'>
                  {initials(name)}
                </div>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium'>{name}</p>
                  <p className='text-muted-foreground truncate text-xs'>
                    {pkg} · {String(b.startDate).slice(0, 10)}
                  </p>
                </div>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                <Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'} className='text-xs'>
                  {b.status}
                </Badge>
                <div className='text-sm font-medium'>
                  {formatRwf(Number(b.totalRwf) || 0)} Rwf
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
