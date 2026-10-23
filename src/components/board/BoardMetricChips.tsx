import { useMemo } from 'react'
import { boards } from '../../i18n/pt-BR'
import { summarizeBoard } from '../../lib/boardSummary'
import type { BoardColumn, Card } from '../../types/database'
import { MetricChip } from '../ui/MetricChip'

type BoardMetricChipsProps = {
  columns: BoardColumn[]
  cards: Card[]
  assigneeIdsByCardId: Map<string, string[]>
}

// A single row that scrolls sideways on narrow screens instead of wrapping, so the board below never moves down.
export function BoardMetricChips({ columns, cards, assigneeIdsByCardId }: BoardMetricChipsProps) {
  const summary = useMemo(() => summarizeBoard(columns, cards, assigneeIdsByCardId), [columns, cards, assigneeIdsByCardId])

  return (
    <dl aria-label={boards.summary.label} className="flex shrink-0 gap-2 overflow-x-auto overscroll-x-contain px-4 md:px-8">
      <MetricChip label={boards.summary.openCards} value={summary.openCardCount} description={boards.summary.openCardsCaption} />
      <MetricChip
        label={boards.summary.withoutAssignee}
        value={summary.unassignedOpenCardCount}
        description={boards.summary.withoutAssigneeCaption}
      />
      <MetricChip
        label={boards.summary.doneThisWeek}
        value={summary.doneThisWeekCount}
        description={boards.summary.doneThisWeekCaption}
      />
    </dl>
  )
}
