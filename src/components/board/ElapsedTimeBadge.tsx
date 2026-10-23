import { Clock } from 'lucide-react'
import { formatElapsedTime } from '../../lib/elapsedTime'
import { Badge } from '../ui/Badge'

type ElapsedTimeBadgeProps = {
  startDate: string | null
}

export function ElapsedTimeBadge({ startDate }: ElapsedTimeBadgeProps) {
  const elapsedTime = formatElapsedTime(startDate)
  if (!elapsedTime) return null

  return (
    <Badge variant="muted" className="shrink-0">
      <Clock aria-hidden="true" className="size-3" />
      {elapsedTime}
    </Badge>
  )
}
