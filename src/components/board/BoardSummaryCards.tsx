import { CheckCircle2, Layers, UserX } from 'lucide-react'
import { useMemo } from 'react'
import { boards } from '../../i18n/pt-BR'
import { summarizeBoard } from '../../lib/boardSummary'
import type { BoardColumn, Card } from '../../types/database'
import { StatCard } from '../ui/StatCard'

type BoardSummaryCardsProps = {
  columns: BoardColumn[]
  cards: Card[]
}

export function BoardSummaryCards({ columns, cards }: BoardSummaryCardsProps) {
  const summary = useMemo(() => summarizeBoard(columns, cards), [columns, cards])

  return (
    <div className="grid grid-cols-1 gap-3 px-4 md:grid-cols-2 md:gap-4 md:px-8 lg:grid-cols-3">
      <StatCard label={boards.summary.openCards} value={summary.openCardCount} caption={boards.summary.openCardsCaption} icon={Layers} />
      <StatCard
        label={boards.summary.withoutAssignee}
        value={summary.unassignedOpenCardCount}
        caption={boards.summary.withoutAssigneeCaption}
        icon={UserX}
      />
      <StatCard
        label={boards.summary.doneThisWeek}
        value={summary.doneThisWeekCount}
        caption={boards.summary.doneThisWeekCaption}
        icon={CheckCircle2}
      />
    </div>
  )
}
