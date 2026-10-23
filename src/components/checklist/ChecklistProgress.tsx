import { checklist } from '../../i18n/pt-BR'
import { ProgressBar } from '../ui/ProgressBar'

type ChecklistProgressProps = {
  doneCount: number
  totalCount: number
}

export function ChecklistProgress({ doneCount, totalCount }: ChecklistProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">{checklist.progress(doneCount, totalCount)}</p>
      <ProgressBar value={doneCount} maximum={totalCount} label={checklist.progressBarLabel} />
    </div>
  )
}
