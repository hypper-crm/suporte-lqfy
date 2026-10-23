import type { CardChecklistActions } from '../../hooks/useCardTasks'
import { checklist, common } from '../../i18n/pt-BR'
import { maximumTaskTitleLength } from '../../lib/checklist'
import type { CardTask, Profile } from '../../types/database'
import { AddItemInput } from '../sortableList/AddItemInput'
import { SortableList } from '../sortableList/SortableList'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'
import { StatusMessage } from '../ui/StatusMessage'
import { ChecklistProgress } from './ChecklistProgress'
import { ChecklistTaskRow } from './ChecklistTaskRow'

export type ChecklistStatus = {
  isLoading: boolean
  loadErrorMessage: string | null
  updateErrorMessage: string | null
  isRealtimeDisconnected: boolean
  reload: () => void
  dismissUpdateError: () => void
}

type ChecklistSectionProps = {
  cardId: string
  // Sorted by position.
  tasks: CardTask[]
  profilesById: Record<string, Profile>
  status: ChecklistStatus
  actions: CardChecklistActions
}

export function ChecklistSection({ cardId, tasks, profilesById, status, actions }: ChecklistSectionProps) {
  const doneCount = tasks.filter((task) => task.is_done).length

  function renderTasks() {
    if (status.isLoading) {
      return (
        <div role="status" aria-label={checklist.title} className="flex flex-col gap-1.5">
          <Skeleton className="h-11 rounded-card" />
          <Skeleton className="h-11 rounded-card" />
          <Skeleton className="h-11 rounded-card" />
        </div>
      )
    }

    if (status.loadErrorMessage) {
      return (
        <div className="flex flex-col items-start gap-2">
          <StatusMessage variant="error">{status.loadErrorMessage}</StatusMessage>
          <Button variant="link" onClick={status.reload}>
            {common.tryAgain}
          </Button>
        </div>
      )
    }

    return (
      <>
        <ChecklistProgress doneCount={doneCount} totalCount={tasks.length} />
        {tasks.length === 0 ? (
          <p className="text-sm text-subtle">{checklist.empty}</p>
        ) : (
          <SortableList
            items={tasks}
            ariaLabel={checklist.title}
            onMove={actions.moveTask}
            renderItem={(task, dragHandleProps) => (
              <ChecklistTaskRow
                task={task}
                completedBy={task.completed_by ? profilesById[task.completed_by] : undefined}
                dragHandleProps={dragHandleProps}
                onToggle={actions.toggleTask}
                onRename={actions.renameTask}
                onDelete={actions.deleteTask}
              />
            )}
          />
        )}
        <AddItemInput
          label={checklist.addLabel}
          placeholder={checklist.addPlaceholder}
          emptyErrorMessage={checklist.titleRequired}
          maximumLength={maximumTaskTitleLength}
          onAdd={(title) => actions.addTask(cardId, title)}
        />
      </>
    )
  }

  return (
    <section className="flex flex-col gap-3">
      <h3 className="section-label">{checklist.title}</h3>
      {status.updateErrorMessage && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusMessage variant="error">{status.updateErrorMessage}</StatusMessage>
          <Button variant="ghost" size="small" onClick={status.dismissUpdateError}>
            {common.dismiss}
          </Button>
        </div>
      )}
      {status.isRealtimeDisconnected && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <StatusMessage variant="info">{checklist.realtimePaused}</StatusMessage>
          <Button variant="link" onClick={status.reload}>
            {common.reload}
          </Button>
        </div>
      )}
      {renderTasks()}
    </section>
  )
}
