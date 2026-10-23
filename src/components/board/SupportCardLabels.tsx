import { priorityLabels, requestTypeLabels } from '../../i18n/pt-BR'
import type { CardPriority, CardRequestType } from '../../types/database'
import { Badge } from '../ui/Badge'

const priorityBadgeVariants = {
  low: 'muted',
  medium: 'neutral',
  high: 'warning',
  urgent: 'danger',
} as const satisfies Record<CardPriority, string>

type SupportCardLabelsProps = {
  priority: CardPriority | null
  requestType: CardRequestType | null
}

export function SupportCardLabels({ priority, requestType }: SupportCardLabelsProps) {
  if (!priority && !requestType) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {priority && <Badge variant={priorityBadgeVariants[priority]}>{priorityLabels[priority]}</Badge>}
      {requestType && <span className="text-[11px] font-medium text-muted">{requestTypeLabels[requestType]}</span>}
    </div>
  )
}
