import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'motion/react'
import type { TaskProgress } from '../../hooks/useCardTasks'
import { toAssigneePeople } from '../../lib/assignees'
import type { CardCoverImage } from '../../lib/cardCover'
import type { ColumnStatus } from '../../types/board'
import type { BoardColumn, Card, Client, Profile } from '../../types/database'
import { Badge } from '../ui/Badge'
import { AddCardForm } from './AddCardForm'
import { SortableCard, type CardPresenceContext } from './SortableCard'

type BoardColumnViewProps = {
  column: BoardColumn
  cards: Card[]
  clients: Client[]
  clientsById: Map<string, Client>
  assigneeIdsByCardId: Map<string, string[]>
  profilesById: Record<string, Profile>
  // Implementation board only.
  columnStatus: ColumnStatus | undefined
  progressByCardId: Map<string, TaskProgress>
  overdueDayCounts: Map<string, number>
  coversByCardId: Map<string, CardCoverImage>
  presenceContext: CardPresenceContext
  onCreateCard: (columnId: string, title: string, clientId: string | null) => Promise<void>
  onOpenCard: (cardId: string) => void
}

export function BoardColumnView({
  column,
  cards,
  clients,
  clientsById,
  assigneeIdsByCardId,
  profilesById,
  columnStatus,
  progressByCardId,
  overdueDayCounts,
  coversByCardId,
  presenceContext,
  onCreateCard,
  onOpenCard,
}: BoardColumnViewProps) {
  // The column itself is a drop target so cards can be dropped into an empty column.
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <section
      className={`flex w-[85vw] shrink-0 snap-start flex-col rounded-card border transition-colors md:max-h-full md:w-72 duration-200 ease-fluid ${
        isOver ? 'border-accent/40 bg-accent/[0.03]' : 'border-border bg-surface/60'
      }`}
    >
      <header className="flex items-center justify-between gap-2 px-3.5 pt-3.5 pb-3">
        <h2 className="min-w-0 truncate text-sm font-medium md:text-[13px]">{column.name}</h2>
        <Badge>{cards.length}</Badge>
      </header>
      <SortableContext id={column.id} items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <motion.ul ref={setNodeRef} layoutScroll className="flex min-h-12 flex-col px-2 pt-0.5 md:overflow-y-auto">
          <AnimatePresence initial={false} custom={presenceContext}>
            {cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                client={card.client_id ? clientsById.get(card.client_id) : undefined}
                assignees={toAssigneePeople(assigneeIdsByCardId.get(card.id), profilesById)}
                taskProgress={progressByCardId.get(card.id)}
                columnStatus={columnStatus}
                overdueDayCount={overdueDayCounts.get(card.id)}
                cover={coversByCardId.get(card.id)}
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
