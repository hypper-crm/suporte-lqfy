import { TriangleAlert } from 'lucide-react'
import { boards } from '../../i18n/pt-BR'
import { Badge } from '../ui/Badge'

type OverdueBadgeProps = {
  // Days since the start date. Nothing is shown when the card is not overdue.
  dayCount: number | undefined
}

export function OverdueBadge({ dayCount }: OverdueBadgeProps) {
  if (dayCount === undefined) return null

  return (
    <Badge variant="warning" className="shrink-0">
      <TriangleAlert aria-hidden="true" className="size-3" />
      {boards.card.overdue(dayCount)}
    </Badge>
  )
}
