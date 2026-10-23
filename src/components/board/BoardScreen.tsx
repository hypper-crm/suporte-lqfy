import { AnimatePresence } from 'motion/react'
import { useMemo, useState } from 'react'
import { useBoard } from '../../hooks/useBoard'
import { useCardTasks } from '../../hooks/useCardTasks'
import { useClients } from '../../hooks/useClients'
import { boards, common } from '../../i18n/pt-BR'
import { ImplementationCardDrawer } from '../../shared/ImplementationCardDrawer'
import { SupportCardDrawer } from '../../shared/SupportCardDrawer'
import type { Board } from '../../types/database'
import { Button } from '../ui/Button'
import { StatusMessage } from '../ui/StatusMessage'
import { BoardSkeleton } from './BoardSkeleton'
import { BoardSummaryCards } from './BoardSummaryCards'
import { KanbanBoard } from './KanbanBoard'

type BoardScreenProps = {
  board: Board
  currentUserId: string
}

const noTasks: never[] = []

export function BoardScreen({ board, currentUserId }: BoardScreenProps) {
  const {
    columns,
    cards,
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
    deleteCard,
  } = useBoard(board, currentUserId)
  const {
    clients,
    isLoading: isLoadingClients,
    loadErrorMessage: clientsErrorMessage,
    isRealtimeDisconnected: isClientsRealtimeDisconnected,
    reload: reloadClients,
  } = useClients()
  // Only implementation cards have checklists.
  const cardTasks = useCardTasks(board === 'implementation', currentUserId)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)

  const profiles = useMemo(
    () =>
      Object.values(profilesById).sort((first, second) =>
        (first.full_name ?? '').localeCompare(second.full_name ?? '', undefined, { sensitivity: 'base' }),
      ),
    [profilesById],
  )

  if (isLoading || isLoadingClients) {
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

  const isAnyRealtimeDisconnected = isRealtimeDisconnected || isClientsRealtimeDisconnected || cardTasks.isRealtimeDisconnected

  function reloadAll() {
    reload()
    reloadClients()
    if (board === 'implementation') cardTasks.reload()
  }

  async function createCardWithChecklist(columnId: string, title: string, clientId: string | null) {
    cardTasks.receiveTasks(await createCard(columnId, title, clientId))
  }

  const selectedCard = selectedCardId ? cards.find((card) => card.id === selectedCardId) : undefined
  const closeDrawer = () => setSelectedCardId(null)

  function renderDrawer() {
    if (!selectedCardId) return null
    const drawerProps = { card: selectedCard, clients, profiles, currentUserId, onSave: updateCard, onDelete: deleteCard, onClose: closeDrawer }

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
      <BoardSummaryCards columns={columns} cards={cards} />
      {(moveErrorMessage || cardTasks.loadErrorMessage || isAnyRealtimeDisconnected) && (
        <div className="flex flex-col gap-2 px-4 md:px-8 pt-4">
          {moveErrorMessage && (
            <div className="flex items-center gap-3">
              <StatusMessage variant="error">{moveErrorMessage}</StatusMessage>
              <Button variant="ghost" size="small" onClick={dismissMoveError}>
                {common.dismiss}
              </Button>
            </div>
          )}
          {cardTasks.loadErrorMessage && (
            <div className="flex items-center gap-3">
              <StatusMessage variant="error">{cardTasks.loadErrorMessage}</StatusMessage>
              <Button variant="link" onClick={cardTasks.reload}>
                {common.tryAgain}
              </Button>
            </div>
          )}
          {isAnyRealtimeDisconnected && (
            <div className="flex items-center gap-3">
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
            profilesById={profilesById}
            progressByCardId={cardTasks.progressByCardId}
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
