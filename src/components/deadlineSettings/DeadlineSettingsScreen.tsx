import { useTeamSettings } from '../../hooks/useTeamSettings'
import { common, deadlineSettings } from '../../i18n/pt-BR'
import { PageHeader } from '../layout/PageHeader'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { StatusMessage } from '../ui/StatusMessage'
import { OverdueAfterDaysForm } from './OverdueAfterDaysForm'

export function DeadlineSettingsScreen() {
  const { overdueAfterDays, isLoading, loadErrorMessage, isRealtimeDisconnected, reload, saveOverdueAfterDays } = useTeamSettings()

  function renderContent() {
    if (isLoading) {
      return (
        <div role="status" aria-label={deadlineSettings.loading} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
      )
    }

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

    return <OverdueAfterDaysForm overdueAfterDays={overdueAfterDays} onSave={saveOverdueAfterDays} />
  }

  return (
    <div className="flex flex-1 flex-col md:min-h-0 md:overflow-y-auto">
      <PageHeader title={deadlineSettings.title} description={deadlineSettings.description} />
      <div className="flex max-w-2xl flex-col gap-4 px-4 pb-8 md:px-8">
        {isRealtimeDisconnected && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusMessage variant="info">{deadlineSettings.realtimePaused}</StatusMessage>
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
