import { AnimatePresence } from 'motion/react'
import { useMemo, useState } from 'react'
import { useBoard } from '../../hooks/useBoard'
import { useCardCovers } from '../../hooks/useCardCovers'
import { useCardTasks } from '../../hooks/useCardTasks'
import { useClients } from '../../hooks/useClients'
import { useTeamSettings } from '../../hooks/useTeamSettings'
import { boards, common } from '../../i18n/pt-BR'
import { getOverdueDayCounts } from '../../lib/boardSummary'
import { resolveCardCover, type CardCoverImage } from '../../lib/cardCover'
import { getColumnStatuses } from '../../lib/columnStatus'
import { ImplementationCardDrawer } from '../../shared/ImplementationCardDrawer'
import { SupportCardDrawer } from '../../shared/SupportCardDrawer'
import type { NewCardFields } from '../../types/board'
import type { Board } from '../../types/database'
import { Button } from '../ui/Button'
import { StatusMessage } from '../ui/StatusMessage'
import { BoardSkeleton } from './BoardSkeleton'
import { BoardMetricChips } from './BoardMetricChips'
import { KanbanBoard } from './KanbanBoard'
import { NewImplementationDrawer, type NewImplementationCardFields } from './NewImplementationDrawer'

type BoardScreenProps = {
  board: Board
  currentUserId: string
  // Implementation board only.
  isNewImplementationOpen: boolean
  onCloseNewImplementation: () => void
}

const noTasks: never[] = []

const noAssigneeIds: string[] = []

export function BoardScreen({ board, currentUserId, isNewImplementationOpen, onCloseNewImplementation }: BoardScreenProps) {
  const {
    columns,
    cards,
    assigneeIdsByCardId,
    profilesById,
    isLoading,
    loadErrorMessage,
    moveErrorMessage,
    isRealtimeDisconnected,
    reload,
    dismissMoveError,
    moveCard,
    createCard,
    updateCard,
    updateCardCover,
    deleteCard,
  } = useBoard(board, currentUserId)
  const {
    clients,
    isLoading: isLoadingClients,
    loadErrorMessage: clientsErrorMessage,
    isRealtimeDisconnected: isClientsRealtimeDisconnected,
    reload: reloadClients,
    createClient,
  } = useClients()
  // Only implementation cards have checklists.
  const cardTasks = useCardTasks(board === 'implementation', currentUserId)
  const teamSettings = useTeamSettings()
  const coverUrls = useCardCovers(cards)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const profiles = useMemo(
    () =>
      Object.values(profilesById).sort((first, second) =>
        (first.full_name ?? '').localeCompare(second.full_name ?? '', undefined, { sensitivity: 'base' }),
      ),
    [profilesById],
  )

  const overdueDayCounts = useMemo(
    () => getOverdueDayCounts(columns, cards, teamSettings.overdueAfterDays),
    [columns, cards, teamSettings.overdueAfterDays],
  )

  const columnStatuses = useMemo(() => getColumnStatuses(columns), [columns])

  const coversByCardId = useMemo(() => {
    const covers = new Map<string, CardCoverImage>()
    for (const card of cards) {
      const cover = resolveCardCover(card, coverUrls)
      if (cover) covers.set(card.id, cover)
    }
    return covers
  }, [cards, coverUrls])

  if (isLoading || isLoadingClients || teamSettings.isLoading) {
    return <BoardSkeleton />
  }

  if (loadErrorMessage) {
    return (
      <div className="flex flex-col items-start gap-2 px-4 md:px-8">
        <StatusMessage variant="error">{loadErrorMessage}</StatusMessage>
        <Button variant="link" onClick={reload}>
          {common.tryAgain}
        </Button>
      </div>
    )
  }

  if (clientsErrorMessage) {
    return (
      <div className="flex flex-col items-start gap-2 px-4 md:px-8">
        <StatusMessage variant="error">{clientsErrorMessage}</StatusMessage>
        <Button variant="link" onClick={reloadClients}>
          {common.tryAgain}
        </Button>
      </div>
    )
  }

  const isAnyRealtimeDisconnected =
    isRealtimeDisconnected ||
    isClientsRealtimeDisconnected ||
    cardTasks.isRealtimeDisconnected ||
    teamSettings.isRealtimeDisconnected

  function reloadAll() {
    reload()
    reloadClients()
    teamSettings.reload()
    if (board === 'implementation') cardTasks.reload()
  }

  async function createCardWithChecklist(fields: NewCardFields) {
    cardTasks.receiveTasks(await createCard(fields))
  }

  // New implementation cards start in the first column.
  async function createImplementationCard({ clientId, title, startDate, description, assigneeIds }: NewImplementationCardFields) {
    const firstColumn = columns[0]
    if (!firstColumn) throw new Error(boards.noColumns)
    await createCardWithChecklist({ columnId: firstColumn.id, title, clientId, startDate, description, assigneeIds })
  }

  const selectedCard = selectedCardId ? cards.find((card) => card.id === selectedCardId) : undefined
  const closeDrawer = () => setSelectedCardId(null)

  function renderDrawer() {
    if (board === 'implementation' && isNewImplementationOpen) {
      return (
        <NewImplementationDrawer
          key="new-implementation"
          profiles={profiles}
          onCreateClient={createClient}
          onCreateCard={createImplementationCard}
          onClose={onCloseNewImplementation}
        />
      )
    }
    if (!selectedCardId) return null
    const drawerProps = {
      card: selectedCard,
      assigneeIds: assigneeIdsByCardId.get(selectedCardId) ?? noAssigneeIds,
      clients,
      profiles,
      currentUserId,
      cover: coversByCardId.get(selectedCardId),
      columnStatus: selectedCard ? columnStatuses.get(selectedCard.column_id) : undefined,
      overdueDayCount: overdueDayCounts.get(selectedCardId),
      onSave: updateCard,
      onUpdateCover: updateCardCover,
      onDelete: deleteCard,
      onClose: closeDrawer,
    }

    if (board === 'support') return <SupportCardDrawer key="card-details" {...drawerProps} />
    return (
      <ImplementationCardDrawer
        key="card-details"
        {...drawerProps}
        profilesById={profilesById}
        tasks={cardTasks.tasksByCardId.get(selectedCardId) ?? noTasks}
        checklistStatus={cardTasks}
        checklistActions={cardTasks}
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BoardMetricChips columns={columns} cards={cards} overdueDayCounts={overdueDayCounts} />
      {(moveErrorMessage || cardTasks.loadErrorMessage || teamSettings.loadErrorMessage || isAnyRealtimeDisconnected) && (
        <div className="flex flex-col gap-2 px-4 md:px-8 pt-4">
          {moveErrorMessage && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusMessage variant="error">{moveErrorMessage}</StatusMessage>
              <Button variant="ghost" size="small" onClick={dismissMoveError}>
                {common.dismiss}
              </Button>
            </div>
          )}
          {cardTasks.loadErrorMessage && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusMessage variant="error">{cardTasks.loadErrorMessage}</StatusMessage>
              <Button variant="link" onClick={cardTasks.reload}>
                {common.tryAgain}
              </Button>
            </div>
          )}
          {teamSettings.loadErrorMessage && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusMessage variant="error">{teamSettings.loadErrorMessage}</StatusMessage>
              <Button variant="link" onClick={teamSettings.reload}>
                {common.tryAgain}
              </Button>
            </div>
          )}
          {isAnyRealtimeDisconnected && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StatusMessage variant="info">{boards.realtimePaused}</StatusMessage>
              <Button variant="link" onClick={reloadAll}>
                {common.reload}
              </Button>
            </div>
          )}
        </div>
      )}
      {columns.length === 0 ? (
        <p className="px-4 md:px-8 pt-6 text-sm text-muted">{boards.noColumns}</p>
      ) : (
        <div className="min-h-0 flex-1">
          <KanbanBoard
            columns={columns}
            cards={cards}
            clients={clients}
            assigneeIdsByCardId={assigneeIdsByCardId}
            profilesById={profilesById}
            progressByCardId={cardTasks.progressByCardId}
            overdueDayCounts={overdueDayCounts}
            coversByCardId={coversByCardId}
            onMoveCard={moveCard}
            onCreateCard={createCardWithChecklist}
            onOpenCard={setSelectedCardId}
          />
        </div>
      )}
      <AnimatePresence>{renderDrawer()}</AnimatePresence>
    </div>
  )
}
