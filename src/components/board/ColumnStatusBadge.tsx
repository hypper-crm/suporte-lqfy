import { boards } from '../../i18n/pt-BR'
import type { ColumnStatus, ColumnStatusTone } from '../../types/board'
import { Badge } from '../ui/Badge'

const toneBadgeVariants = {
  neutral: 'neutral',
  warning: 'warning',
  success: 'success',
} as const satisfies Record<ColumnStatusTone, string>

type ColumnStatusBadgeProps = {
  status: ColumnStatus
}

export function ColumnStatusBadge({ status }: ColumnStatusBadgeProps) {
  return (
    <Badge variant={toneBadgeVariants[status.tone]} className="min-w-0">
      <span className="truncate" title={boards.card.statusLabel(status.name)}>
        {status.name}
      </span>
    </Badge>
  )
}
