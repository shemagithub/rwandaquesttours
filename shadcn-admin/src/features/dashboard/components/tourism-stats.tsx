import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useBootstrapQuery } from '@/hooks/use-bootstrap-query'

function formatRwf(n: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(n)
}

export function TourismStats() {
  const { data, isPending, isError } = useBootstrapQuery()

  if (isPending) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className='pb-2'>
              <Skeleton className='h-4 w-24' />
            </CardHeader>
            <CardContent>
              <Skeleton className='mb-2 h-8 w-32' />
              <Skeleton className='h-3 w-40' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className='text-muted-foreground rounded-lg border border-dashed p-4 text-sm'>
        Could not load live stats. Is the API running at{' '}
        <code className='text-foreground'>/api</code> (see{' '}
        <code className='text-foreground'>VITE_API_URL</code>)?
      </div>
    )
  }

  const revenue = data.monthlyMetrics.reduce((s, m) => s + m.revenueRwf, 0)
  const users = data.tourismUsers.length
  const bookings = data.bookings.length
  const packages = data.packages.length
  const rentalList = data.carRentalRequests ?? []
  const rentalLeads = rentalList.length
  const rentalPending = rentalList.filter(
    (r) =>
      typeof r === 'object' &&
      r !== null &&
      'status' in r &&
      (r as { status: string }).status === 'pending',
  ).length

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Revenue (Rwf)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{formatRwf(revenue)}</div>
          <p className='text-muted-foreground text-xs'>
            Sum of monthly metrics in the database
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{users}</div>
          <p className='text-muted-foreground text-xs'>Registered tourism users</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{bookings}</div>
          <p className='text-muted-foreground text-xs'>All booking records</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Tour packages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{packages}</div>
          <p className='text-muted-foreground text-xs'>Packages in catalog</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Car rental</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{rentalPending}</div>
          <p className='text-muted-foreground text-xs'>
            Pending of {rentalLeads} lead{rentalLeads === 1 ? '' : 's'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
