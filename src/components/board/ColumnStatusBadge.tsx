import { boards } from '../../i18n/pt-BR'
import type { ColumnStatus } from '../../types/board'
import type { BoardColumnColor } from '../../types/database'
import { Badge } from '../ui/Badge'

const colorBadgeVariants = {
  neutral: 'neutral',
  blue: 'info',
  amber: 'warning',
  green: 'success',
  red: 'danger',
} as const satisfies Record<BoardColumnColor, string>

type ColumnStatusBadgeProps = {
  status: ColumnStatus
}

export function ColumnStatusBadge({ status }: ColumnStatusBadgeProps) {
  return (
    <Badge variant={colorBadgeVariants[status.color]} className="min-w-0">
      <span className="truncate" title={boards.card.statusLabel(status.name)}>
        {status.name}
      </span>
    </Badge>
  )
}
