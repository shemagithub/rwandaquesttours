import { getRouteApi } from '@tanstack/react-router'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { useUsersQuery } from './hooks/use-users-query'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { data: users = [], isPending, isError, error, refetch } = useUsersQuery()

  return (
    <UsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users and their roles here. Data loads from the tourism
              API (<code className='text-foreground'>/api/users</code>).
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        {isError && (
          <Alert variant='destructive'>
            <AlertTitle>Could not load users</AlertTitle>
            <AlertDescription className='flex flex-col gap-2'>
              <span>
                {(error as Error)?.message ?? 'Request failed. Is the backend running?'}
              </span>
              <button
                type='button'
                className='text-primary w-fit text-sm underline'
                onClick={() => void refetch()}
              >
                Retry
              </button>
            </AlertDescription>
          </Alert>
        )}
        {isPending ? (
          <div className='space-y-2'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-64 w-full' />
          </div>
        ) : (
          <UsersTable data={users} search={search} navigate={navigate} />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
