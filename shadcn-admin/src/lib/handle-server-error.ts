import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'No content.'
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data as
      | { title?: string; error?: string; message?: string }
      | undefined
    const title = data?.title
    if (typeof title === 'string' && title.length > 0) {
      errMsg = title
    } else if (typeof data?.error === 'string' && data.error.length > 0) {
      errMsg = data.error
    } else if (typeof data?.message === 'string' && data.message.length > 0) {
      errMsg = data.message
    } else if (status === 401) {
      errMsg = 'Unauthorized (invalid email/password or expired session).'
    }
  }

  toast.error(errMsg)
}
