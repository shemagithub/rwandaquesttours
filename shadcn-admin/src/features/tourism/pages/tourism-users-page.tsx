import { TourismUsersSegmentPage } from '../views/users-segment-view'

type Props = {
  segment: 'staff' | 'guide'
  title: string
  description: string
}

const map = { staff: 'staff', guide: 'guide' } as const

export function TourismUsersPage({ segment, title, description }: Props) {
  return (
    <TourismUsersSegmentPage
      segment={map[segment]}
      title={title}
      description={description}
    />
  )
}
