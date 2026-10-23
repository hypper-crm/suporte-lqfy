import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { positionAfterLast, sortColumns } from '../lib/cardPosition'
import { removeById, upsertById } from '../lib/rows'
import { fetchBoardColumns, subscribeToBoardColumnChanges } from '../services/boardService'
import { listAllCardAssignees, subscribeToCardAssigneeChanges, updateCardAssignees } from '../services/cardAssigneeService'
import {
  createCard as createCardRequest,
  deleteCard as deleteCardRequest,
  fetchCards,
  moveCard as moveCardRequest,
  subscribeToCardChanges,
  updateCard as updateCardRequest,
} from '../services/cardService'
import { listProfiles } from '../services/profileService'
import type { CardDetailsInput, CardMove, SavedCardDetails } from '../types/board'
import type { Board, BoardColumn, Card, CardAssignee, CardTask, Profile } from '../types/database'

// How long an optimistic move waits for its own realtime echo before the echo is no longer expected.
const pendingEchoTimeoutInMilliseconds = 10_000

export type BoardState = {
  columns: BoardColumn[]
  cards: Card[]
  // Profile ids of each card's assignees. Cards without assignees are missing from the map.
  assigneeIdsByCardId: Map<string, string[]>
  profilesById: Record<string, Profile>
  isLoading: boolean
  loadErrorMessage: string | null
  moveErrorMessage: string | null
  isRealtimeDisconnected: boolean
  reload: () => void
  dismissMoveError: () => void
  moveCard: (cardId: string, move: CardMove) => void
  // Resolves with the checklist copied into a new implementation card.
  createCard: (columnId: string, title: string, clientId: string | null) => Promise<CardTask[]>
  updateCard: (cardId: string, input: CardDetailsInput) => Promise<SavedCardDetails>
  deleteCard: (cardId: string) => Promise<void>
}

function isSameAssignee(first: CardAssignee, second: CardAssignee): boolean {
  return first.card_id === second.card_id && first.profile_id === second.profile_id
}

function addAssignees(assignees: CardAssignee[], added: CardAssignee[]): CardAssignee[] {
  const newAssignees = added.filter((row) => !assignees.some((current) => isSameAssignee(current, row)))
  return newAssignees.length > 0 ? [...assignees, ...newAssignees] : assignees
}

function removeAssignees(assignees: CardAssignee[], removed: CardAssignee[]): CardAssignee[] {
  return assignees.filter((current) => !removed.some((row) => isSameAssignee(current, row)))
}

function isSameMove(card: Card, move: CardMove): boolean {
  return card.column_id === move.columnId && card.position === move.position
}

export function useBoard(board: Board, currentUserId: string): BoardState {
  const [columns, setColumns] = useState<BoardColumn[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [assignees, setAssignees] = useState<CardAssignee[]>([])
  const [profilesById, setProfilesById] = useState<Record<string, Profile>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null)
  const [moveErrorMessage, setMoveErrorMessage] = useState<string | null>(null)
  const [disconnectedChannels, setDisconnectedChannels] = useState({ columns: false, cards: false, assignees: false })
  const [reloadCount, setReloadCount] = useState(0)

  // Moves this user applied optimistically and whose realtime echo has not arrived yet, per card id.
  const pendingMovesRef = useRef(new Map<string, CardMove[]>())

  const forgetPendingMove = useCallback((cardId: string, move: CardMove) => {
    const pendingMoves = pendingMovesRef.current.get(cardId)
    if (!pendingMoves) return
    const index = pendingMoves.indexOf(move)
    if (index >= 0) pendingMoves.splice(index, 1)
    if (pendingMoves.length === 0) pendingMovesRef.current.delete(cardId)
  }, [])

  const isOwnMoveEcho = useCallback(
    (card: Card): boolean => {
      const matchingMove = pendingMovesRef.current.get(card.id)?.find((move) => isSameMove(card, move))
      if (!matchingMove) return false
      forgetPendingMove(card.id, matchingMove)
      return true
    },
    [forgetPendingMove],
  )

  useEffect(() => {
    const unsubscribeFromColumns = subscribeToBoardColumnChanges(board, {
      onUpsert: (column) =>
        setColumns((current) =>
          column.board === board ? sortColumns(upsertById(current, column)) : removeById(current, column.id),
        ),
      onDelete: (columnId) => setColumns((current) => removeById(current, columnId)),
      onConnectionChange: (isConnected) => setDisconnectedChannels((current) => ({ ...current, columns: !isConnected })),
    })

    const unsubscribeFromCards = subscribeToCardChanges(board, {
      onUpsert: (card) => {
        if (isOwnMoveEcho(card)) return
        setCards((current) => (card.board === board ? upsertById(current, card) : removeById(current, card.id)))
      },
      onDelete: (cardId) => setCards((current) => removeById(current, cardId)),
      onConnectionChange: (isConnected) => setDisconnectedChannels((current) => ({ ...current, cards: !isConnected })),
    })

    const unsubscribeFromAssignees = subscribeToCardAssigneeChanges({
      onInsert: (row) => setAssignees((current) => addAssignees(current, [row])),
      onDelete: (row) => setAssignees((current) => removeAssignees(current, [row])),
      onConnectionChange: (isConnected) => setDisconnectedChannels((current) => ({ ...current, assignees: !isConnected })),
    })

    return () => {
      unsubscribeFromColumns()
      unsubscribeFromCards()
      unsubscribeFromAssignees()
    }
  }, [board, isOwnMoveEcho])

  useEffect(() => {
    let isActive = true
    setIsLoading(true)
    setLoadErrorMessage(null)

    Promise.all([fetchBoardColumns(board), fetchCards(board), listAllCardAssignees(), listProfiles()])
      .then(([loadedColumns, loadedCards, loadedAssignees, loadedProfiles]) => {
        if (!isActive) return
        setColumns(loadedColumns)
        setCards(loadedCards)
        setAssignees(loadedAssignees)
        setProfilesById(Object.fromEntries(loadedProfiles.map((profile) => [profile.id, profile])))
      })
      .catch((error: Error) => {
        if (isActive) setLoadErrorMessage(error.message)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [board, reloadCount])

  const assigneeIdsByCardId = useMemo(() => {
    const assigneeIds = new Map<string, string[]>()
    for (const row of assignees) assigneeIds.set(row.card_id, [...(assigneeIds.get(row.card_id) ?? []), row.profile_id])
    return assigneeIds
  }, [assignees])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])

  const dismissMoveError = useCallback(() => setMoveErrorMessage(null), [])

  const moveCard = useCallback(
    (cardId: string, move: CardMove) => {
      const previousCard = cards.find((card) => card.id === cardId)
      if (!previousCard || isSameMove(previousCard, move)) return

      const pendingMoves = pendingMovesRef.current.get(cardId) ?? []
      pendingMoves.push(move)
      pendingMovesRef.current.set(cardId, pendingMoves)
      window.setTimeout(() => forgetPendingMove(cardId, move), pendingEchoTimeoutInMilliseconds)

      setMoveErrorMessage(null)
      setCards((current) =>
        current.map((card) => (card.id === cardId ? { ...card, column_id: move.columnId, position: move.position } : card)),
      )

      moveCardRequest(cardId, move).catch((error: Error) => {
        forgetPendingMove(cardId, move)
        setMoveErrorMessage(error.message)
        // Revert only if nobody changed the card again in the meantime.
        setCards((current) =>
          current.map((card) =>
            card.id === cardId && isSameMove(card, move)
              ? { ...card, column_id: previousCard.column_id, position: previousCard.position }
              : card,
          ),
        )
      })
    },
    [cards, forgetPendingMove],
  )

  const createCard = useCallback(
    async (columnId: string, title: string, clientId: string | null) => {
      const position = positionAfterLast(cards.filter((card) => card.column_id === columnId))
      const { card: createdCard, tasks } = await createCardRequest({ board, columnId, title, clientId, position, createdBy: currentUserId })
      setCards((current) => upsertById(current, createdCard))
      return tasks
    },
    [board, cards, currentUserId],
  )

  const updateCard = useCallback(
    async (cardId: string, { assigneeIds, ...cardInput }: CardDetailsInput) => {
      const updatedCard = await updateCardRequest(cardId, cardInput)
      setCards((current) => upsertById(current, updatedCard))

      const currentAssigneeIds = assigneeIdsByCardId.get(cardId) ?? []
      const addedIds = assigneeIds.filter((profileId) => !currentAssigneeIds.includes(profileId))
      const removedIds = currentAssigneeIds.filter((profileId) => !assigneeIds.includes(profileId))
      await updateCardAssignees(cardId, addedIds, removedIds)
      const toRows = (profileIds: string[]) => profileIds.map((profileId) => ({ card_id: cardId, profile_id: profileId }))
      setAssignees((current) => addAssignees(removeAssignees(current, toRows(removedIds)), toRows(addedIds)))
      return { card: updatedCard, assigneeIds }
    },
    [assigneeIdsByCardId],
  )

  const deleteCard = useCallback(async (cardId: string) => {
    await deleteCardRequest(cardId)
    setCards((current) => removeById(current, cardId))
    setAssignees((current) => current.filter((row) => row.card_id !== cardId))
  }, [])

  return {
    columns,
    cards,
    assigneeIdsByCardId,
    profilesById,
    isLoading,
    loadErrorMessage,
    moveErrorMessage,
    isRealtimeDisconnected: disconnectedChannels.columns || disconnectedChannels.cards || disconnectedChannels.assignees,
    reload,
    dismissMoveError,
    moveCard,
    createCard,
    updateCard,
    deleteCard,
  }
}
