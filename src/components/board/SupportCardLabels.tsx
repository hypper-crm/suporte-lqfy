import { priorityLabels, requestTypeLabels } from '../../i18n/pt-BR'
import type { ColumnStatus } from '../../types/board'
import type { CardPriority, CardRequestType } from '../../types/database'
import { Badge } from '../ui/Badge'
import { ColumnStatusBadge } from './ColumnStatusBadge'
import { OverdueBadge } from './OverdueBadge'

const priorityBadgeVariants = {
  low: 'muted',
  medium: 'neutral',
  high: 'warning',
  urgent: 'danger',
} as const satisfies Record<CardPriority, string>

type SupportCardLabelsProps = {
  priority: CardPriority | null
  requestType: CardRequestType | null
  overdueDayCount: number | undefined
  columnStatus: ColumnStatus | undefined
}

export function SupportCardLabels({ priority, requestType, overdueDayCount, columnStatus }: SupportCardLabelsProps) {
  if (!priority && !requestType && overdueDayCount === undefined && !columnStatus) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {columnStatus && <ColumnStatusBadge status={columnStatus} />}
      {priority && <Badge variant={priorityBadgeVariants[priority]}>{priorityLabels[priority]}</Badge>}
      <OverdueBadge dayCount={overdueDayCount} />
      {requestType && <span className="text-[11px] font-medium text-muted">{requestTypeLabels[requestType]}</span>}
    </div>
  )
}
