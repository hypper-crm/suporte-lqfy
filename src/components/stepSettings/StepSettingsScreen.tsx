import { useStepTemplates } from '../../hooks/useStepTemplates'
import { common, stepSettings } from '../../i18n/pt-BR'
import { maximumTaskTitleLength } from '../../lib/checklist'
import { PageHeader } from '../layout/PageHeader'
import { AddItemInput } from '../sortableList/AddItemInput'
import { SortableList } from '../sortableList/SortableList'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { StatusMessage } from '../ui/StatusMessage'
import { StepTemplateListSkeleton } from './StepTemplateListSkeleton'
import { StepTemplateRow } from './StepTemplateRow'

export function StepSettingsScreen() {
  const {
    stepTemplates,
    isLoading,
    loadErrorMessage,
    moveErrorMessage,
    isRealtimeDisconnected,
    reload,
    dismissMoveError,
    addStepTemplate,
    renameStepTemplate,
    deleteStepTemplate,
    moveStepTemplate,
  } = useStepTemplates()

  function renderContent() {
    if (isLoading) return <StepTemplateListSkeleton />

    if (loadErrorMessage) {
      return (
        <div className="flex flex-col items-start gap-2">
          <StatusMessage variant="error">{loadErrorMessage}</StatusMessage>
          <Button variant="link" onClick={reload}>
            {common.tryAgain}
          </Button>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-3">
        {stepTemplates.length === 0 ? (
          <p className="text-sm text-subtle">{stepSettings.empty}</p>
        ) : (
          <SortableList
            items={stepTemplates}
            ariaLabel={stepSettings.title}
            onMove={moveStepTemplate}
            renderItem={(stepTemplate, dragHandleProps) => (
              <StepTemplateRow
                stepTemplate={stepTemplate}
                stepNumber={stepTemplates.indexOf(stepTemplate) + 1}
                dragHandleProps={dragHandleProps}
                onRename={renameStepTemplate}
                onDelete={deleteStepTemplate}
              />
            )}
          />
        )}
        <AddItemInput
          label={stepSettings.addLabel}
          placeholder={stepSettings.addPlaceholder}
          emptyErrorMessage={stepSettings.titleRequired}
          maximumLength={maximumTaskTitleLength}
          onAdd={addStepTemplate}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader title={stepSettings.title} description={stepSettings.description} />
      <div className="flex max-w-2xl flex-col gap-4 px-4 pb-8 md:px-8">
        {moveErrorMessage && (
          <div className="flex items-center gap-3">
            <StatusMessage variant="error">{moveErrorMessage}</StatusMessage>
            <Button variant="ghost" size="small" onClick={dismissMoveError}>
              {common.dismiss}
            </Button>
          </div>
        )}
        {isRealtimeDisconnected && (
          <div className="flex items-center gap-3">
            <StatusMessage variant="info">{stepSettings.realtimePaused}</StatusMessage>
            <Button variant="link" onClick={reload}>
              {common.reload}
            </Button>
          </div>
        )}
        <Card className="p-4">{renderContent()}</Card>
      </div>
    </div>
  )
}
