import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ResourceRowActions({
  onView,
  onEdit,
  onDelete,
  className,
}: {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center justify-end gap-0.5', className)}>
      {onView ? (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-8'
          title='View'
          onClick={onView}
        >
          <Eye className='size-4' />
        </Button>
      ) : null}
      {onEdit ? (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-8'
          title='Edit'
          onClick={onEdit}
        >
          <Pencil className='size-4' />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='text-destructive hover:text-destructive size-8'
          title='Delete'
          onClick={onDelete}
        >
          <Trash2 className='size-4' />
        </Button>
      ) : null}
    </div>
  )
}
