import type { TaskProgress } from '../../hooks/useCardTasks'
import { boards } from '../../i18n/pt-BR'
import { ProgressBar } from '../ui/ProgressBar'

type CardTaskProgressProps = {
  progress: TaskProgress
}

export function CardTaskProgress({ progress: { doneCount, totalCount } }: CardTaskProgressProps) {
  const label = boards.card.taskProgressLabel(doneCount, totalCount)

  return (
    <div className="flex min-w-0 items-center gap-2" title={label}>
      <span className="shrink-0 text-[11px] font-medium text-muted">
        {doneCount}/{totalCount}
      </span>
      <div className="w-16">
        <ProgressBar value={doneCount} maximum={totalCount} label={label} size="thin" />
      </div>
    </div>
  )
}
