import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'motion/react'
import type { TaskProgress } from '../../hooks/useCardTasks'
import type { BoardColumn, Card, Client, Profile } from '../../types/database'
import { Badge } from '../ui/Badge'
import { AddCardForm } from './AddCardForm'
import { SortableCard, type CardPresenceContext } from './SortableCard'

type BoardColumnViewProps = {
  column: BoardColumn
  cards: Card[]
  clients: Client[]
  clientsById: Map<string, Client>
  profilesById: Record<string, Profile>
  progressByCardId: Map<string, TaskProgress>
  presenceContext: CardPresenceContext
  onCreateCard: (columnId: string, title: string, clientId: string | null) => Promise<void>
  onOpenCard: (cardId: string) => void
}

export function BoardColumnView({
  column,
  cards,
  clients,
  clientsById,
  profilesById,
  progressByCardId,
  presenceContext,
  onCreateCard,
  onOpenCard,
}: BoardColumnViewProps) {
  // The column itself is a drop target so cards can be dropped into an empty column.
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <section
      className={`flex max-h-full w-72 shrink-0 flex-col rounded-card border transition-colors duration-200 ease-fluid ${
        isOver ? 'border-accent/40 bg-accent/[0.03]' : 'border-border bg-surface/60'
      }`}
    >
      <header className="flex items-center justify-between gap-2 px-3.5 pt-3.5 pb-3">
        <h2 className="truncate text-[13px] font-medium">{column.name}</h2>
        <Badge>{cards.length}</Badge>
      </header>
      <SortableContext id={column.id} items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <motion.ul ref={setNodeRef} layoutScroll className="flex min-h-12 flex-col overflow-y-auto px-2 pt-0.5">
          <AnimatePresence initial={false} custom={presenceContext}>
            {cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                client={card.client_id ? clientsById.get(card.client_id) : undefined}
                assignee={card.assignee_id ? profilesById[card.assignee_id] : undefined}
                taskProgress={progressByCardId.get(card.id)}
                presenceContext={presenceContext}
                onOpen={onOpenCard}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      </SortableContext>
      <div className="px-2 pb-2">
        <AddCardForm clients={clients} onCreate={(title, clientId) => onCreateCard(column.id, title, clientId)} />
      </div>
    </section>
  )
}
