import { stepSettings } from '../../i18n/pt-BR'
import { maximumTaskTitleLength } from '../../lib/checklist'
import type { ImplementationStepTemplate } from '../../types/database'
import { ConfirmDeleteButton } from '../sortableList/ConfirmDeleteButton'
import { DragHandle } from '../sortableList/DragHandle'
import { InlineEditableText } from '../sortableList/InlineEditableText'
import type { DragHandleProps } from '../sortableList/SortableListItem'

type StepTemplateRowProps = {
  stepTemplate: ImplementationStepTemplate
  stepNumber: number
  dragHandleProps: DragHandleProps
  onRename: (stepTemplateId: string, title: string) => Promise<void>
  onDelete: (stepTemplateId: string) => Promise<void>
}

export function StepTemplateRow({ stepTemplate, stepNumber, dragHandleProps, onRename, onDelete }: StepTemplateRowProps) {
  return (
    <div className="flex items-start gap-2 p-2">
      <DragHandle {...dragHandleProps} />
      <span className="flex h-7 min-w-6 items-center justify-center text-xs font-medium text-subtle">{stepNumber}</span>
      <InlineEditableText
        value={stepTemplate.title}
        renameLabel={stepSettings.renameLabel(stepTemplate.title)}
        editLabel={stepSettings.editLabel}
        emptyErrorMessage={stepSettings.titleRequired}
        maximumLength={maximumTaskTitleLength}
        onSave={(title) => onRename(stepTemplate.id, title)}
      />
      <ConfirmDeleteButton
        label={stepSettings.deleteLabel(stepTemplate.title)}
        confirmationText={stepSettings.deleteConfirmation}
        note={stepSettings.deleteNote}
        onConfirm={() => onDelete(stepTemplate.id)}
      />
    </div>
  )
}
