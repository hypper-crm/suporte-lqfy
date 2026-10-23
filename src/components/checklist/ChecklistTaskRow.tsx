import { checklist } from '../../i18n/pt-BR'
import { maximumTaskTitleLength } from '../../lib/checklist'
import { formatDateTime } from '../../lib/formatting'
import type { CardTask, Profile } from '../../types/database'
import { ConfirmDeleteButton } from '../sortableList/ConfirmDeleteButton'
import { DragHandle } from '../sortableList/DragHandle'
import { InlineEditableText } from '../sortableList/InlineEditableText'
import type { DragHandleProps } from '../sortableList/SortableListItem'

type ChecklistTaskRowProps = {
  task: CardTask
  completedBy: Profile | undefined
  dragHandleProps: DragHandleProps
  onToggle: (task: CardTask) => void
  onRename: (taskId: string, title: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
}

export function ChecklistTaskRow({ task, completedBy, dragHandleProps, onToggle, onRename, onDelete }: ChecklistTaskRowProps) {
  const completedAt = formatDateTime(task.completed_at)

  return (
    <div className="flex items-start gap-2 p-2">
      <DragHandle {...dragHandleProps} />
      <span className="flex h-7 shrink-0 items-center">
        <input
          type="checkbox"
          aria-label={checklist.toggleLabel(task.title)}
          checked={task.is_done}
          onChange={() => onToggle(task)}
          className="size-4 accent-accent outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <InlineEditableText
          value={task.title}
          renameLabel={checklist.renameLabel(task.title)}
          editLabel={checklist.editLabel}
          emptyErrorMessage={checklist.titleRequired}
          maximumLength={maximumTaskTitleLength}
          textClassName={task.is_done ? 'text-muted line-through decoration-subtle' : ''}
          onSave={(title) => onRename(task.id, title)}
        />
        {task.is_done && completedAt && (
          <p className="px-1.5 pb-0.5 text-xs text-subtle">
            {checklist.completedBy(completedBy?.full_name || checklist.unknownTeamMember, completedAt)}
          </p>
        )}
      </div>
      <ConfirmDeleteButton
        label={checklist.deleteLabel(task.title)}
        confirmationText={checklist.deleteConfirmation}
        onConfirm={() => onDelete(task.id)}
      />
    </div>
  )
}
