import {
  closestCorners,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { motion, useReducedMotion } from 'motion/react'
import { useMemo, useState } from 'react'
import type { TaskProgress } from '../../hooks/useCardTasks'
import { groupCardIdsByColumn, positionBetween, type CardIdsByColumn } from '../../lib/cardPosition'
import { mouseActivationConstraint, touchActivationConstraint } from '../../lib/dragSensors'
import type { CardMove } from '../../types/board'
import type { BoardColumn, Card, Client, Profile } from '../../types/database'
import { fluidEaseCss } from '../ui/motionPresets'
import { BoardColumnView } from './BoardColumnView'
import { CardContent } from './CardContent'

type KanbanBoardProps = {
  columns: BoardColumn[]
  cards: Card[]
  clients: Client[]
  profilesById: Record<string, Profile>
  progressByCardId: Map<string, TaskProgress>
  onMoveCard: (cardId: string, move: CardMove) => void
  onCreateCard: (columnId: string, title: string, clientId: string | null) => Promise<void>
  onOpenCard: (cardId: string) => void
}

// Returns the column that holds the given card, or the column itself when the id is a column id.
function findColumnId(cardIdsByColumn: CardIdsByColumn, itemId: UniqueIdentifier): string | undefined {
  const id = String(itemId)
  if (id in cardIdsByColumn) return id
  return Object.keys(cardIdsByColumn).find((columnId) => cardIdsByColumn[columnId].includes(id))
}

const dropDurationInMilliseconds = 320

const hideActiveCardWhileDropping = defaultDropAnimationSideEffects({ styles: { active: { opacity: '0' } } })

// The card settles into its slot with a slight overshoot, and the lift (scale and tilt) eases back out.
const dropAnimation: DropAnimation = {
  duration: dropDurationInMilliseconds,
  easing: 'cubic-bezier(0.2, 1.25, 0.4, 1)',
  sideEffects: (parameters) => {
    const liftedNode = parameters.dragOverlay.node.querySelector<HTMLElement>('[data-drag-lift]')
    liftedNode?.animate([{ transform: 'scale(1.02) rotate(1.5deg)' }, { transform: 'none' }], {
      duration: dropDurationInMilliseconds,
      easing: fluidEaseCss,
      fill: 'forwards',
    })
    return hideActiveCardWhileDropping(parameters)
  },
}

// Enter is not a drag key, because it opens the focused card.
const keyboardDragCodes = { start: ['Space'], cancel: ['Escape'], end: ['Space'] }

export function KanbanBoard({
  columns,
  cards,
  clients,
  profilesById,
  progressByCardId,
  onMoveCard,
  onCreateCard,
  onOpenCard,
}: KanbanBoardProps) {
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  // While dragging, the card order is previewed locally and only saved on drop.
  const [previewCardIds, setPreviewCardIds] = useState<CardIdsByColumn | null>(null)
  const isReducedMotion = useReducedMotion() ?? false

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: mouseActivationConstraint }),
    useSensor(TouchSensor, { activationConstraint: touchActivationConstraint }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, keyboardCodes: keyboardDragCodes }),
  )

  const savedCardIds = useMemo(() => groupCardIdsByColumn(columns, cards), [columns, cards])
  const cardsById = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards])
  const clientsById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients])
  const visibleCardIds = previewCardIds ?? savedCardIds
  const activeCard = activeCardId ? cardsById.get(activeCardId) : undefined
  const presenceContext = useMemo(
    () => ({ isDragActive: activeCardId !== null, isReducedMotion }),
    [activeCardId, isReducedMotion],
  )

  function resetDrag() {
    setActiveCardId(null)
    setPreviewCardIds(null)
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveCardId(String(active.id))
    setPreviewCardIds(savedCardIds)
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    setPreviewCardIds((current) => {
      if (!current) return current
      const sourceColumnId = findColumnId(current, active.id)
      const targetColumnId = findColumnId(current, over.id)
      if (!sourceColumnId || !targetColumnId || sourceColumnId === targetColumnId) return current

      const activeId = String(active.id)
      const targetIds = current[targetColumnId]
      const overIndex = targetIds.indexOf(String(over.id))
      const activeTop = active.rect.current.translated?.top ?? 0
      const isBelowOverCard = overIndex >= 0 && activeTop > over.rect.top + over.rect.height / 2
      const insertIndex = overIndex >= 0 ? overIndex + (isBelowOverCard ? 1 : 0) : targetIds.length

      return {
        ...current,
        [sourceColumnId]: current[sourceColumnId].filter((id) => id !== activeId),
        [targetColumnId]: [...targetIds.slice(0, insertIndex), activeId, ...targetIds.slice(insertIndex)],
      }
    })
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    const previewIds = previewCardIds
    resetDrag()
    if (!over || !previewIds) return

    const activeId = String(active.id)
    const columnId = findColumnId(previewIds, activeId)
    const card = cardsById.get(activeId)
    if (!columnId || !card) return

    const columnIds = previewIds[columnId]
    const activeIndex = columnIds.indexOf(activeId)
    const overIndex = columnIds.indexOf(String(over.id))
    const finalIds = overIndex >= 0 && overIndex !== activeIndex ? arrayMove(columnIds, activeIndex, overIndex) : columnIds

    const finalIndex = finalIds.indexOf(activeId)
    const savedIds = savedCardIds[columnId] ?? []
    const isUnchanged = card.column_id === columnId && savedIds.indexOf(activeId) === finalIndex
    if (isUnchanged) return

    const previousCard = cardsById.get(finalIds[finalIndex - 1])
    const nextCard = cardsById.get(finalIds[finalIndex + 1])
    onMoveCard(activeId, { columnId, position: positionBetween(previousCard?.position, nextCard?.position) })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDrag}
    >
      {/* Below the md breakpoint columns snap into place. Snapping pauses while dragging so auto-scroll can move freely. */}
      <motion.div
        layoutScroll
        className={`flex items-start gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pt-5 pb-6 md:h-full md:gap-4 md:px-8 md:pt-6 ${
          activeCardId ? '' : 'snap-x snap-mandatory md:snap-none'
        }`}
      >
        {columns.map((column) => (
          <BoardColumnView
            key={column.id}
            column={column}
            cards={(visibleCardIds[column.id] ?? []).flatMap((id) => cardsById.get(id) ?? [])}
            clients={clients}
            clientsById={clientsById}
            profilesById={profilesById}
            progressByCardId={progressByCardId}
            presenceContext={presenceContext}
            onCreateCard={onCreateCard}
            onOpenCard={onOpenCard}
          />
        ))}
      </motion.div>
      <DragOverlay dropAnimation={isReducedMotion ? null : dropAnimation} style={{ zIndex: 'var(--z-overlay)' }}>
        {activeCard && (
          <CardContent
            card={activeCard}
            client={activeCard.client_id ? clientsById.get(activeCard.client_id) : undefined}
            assignee={activeCard.assignee_id ? profilesById[activeCard.assignee_id] : undefined}
            taskProgress={progressByCardId.get(activeCard.id)}
            appearance="dragOverlay"
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
