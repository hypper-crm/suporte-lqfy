import { useMemo } from 'react'
import { boards } from '../../i18n/pt-BR'
import { summarizeBoard } from '../../lib/boardSummary'
import type { BoardColumn, Card } from '../../types/database'
import { MetricChip } from '../ui/MetricChip'

type BoardMetricChipsProps = {
  columns: BoardColumn[]
  cards: Card[]
  overdueDayCounts: Map<string, number>
}

// Three equal columns in a single row: they never scroll, wrap or grow taller.
export function BoardMetricChips({ columns, cards, overdueDayCounts }: BoardMetricChipsProps) {
  const summary = useMemo(() => summarizeBoard(columns, cards, overdueDayCounts), [columns, cards, overdueDayCounts])

  return (
    <dl aria-label={boards.summary.label} className="grid shrink-0 grid-cols-3 gap-2 px-4 md:px-8">
      <MetricChip label={boards.summary.open} value={summary.openCount} description={boards.summary.openCaption} />
      <MetricChip label={boards.summary.done} value={summary.doneCount} description={boards.summary.doneCaption} />
      <MetricChip
        label={boards.summary.overdue}
        value={summary.overdueCount}
        description={boards.summary.overdueCaption}
        isWarning
      />
    </dl>
  )
}
