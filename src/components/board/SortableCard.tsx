import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, type Variants } from 'motion/react'
import type { TaskProgress } from '../../hooks/useCardTasks'
import { boards } from '../../i18n/pt-BR'
import type { CardCoverImage } from '../../lib/cardCover'
import type { ColumnStatus } from '../../types/board'
import type { Card, Client } from '../../types/database'
import type { AvatarStackPerson } from '../ui/AvatarStack'
import { fluidEaseCss } from '../ui/motionPresets'
import { CardContent } from './CardContent'

export type CardPresenceContext = {
  isDragActive: boolean
  isReducedMotion: boolean
}

// While a drag is active, cards jump between columns instantly so dnd-kit can measure them in place.
export const cardPresenceVariants: Variants = {
  hidden: ({ isDragActive }: CardPresenceContext) => (isDragActive ? { opacity: 1 } : { opacity: 0, y: 8 }),
  visible: { opacity: 1, y: 0 },
  exit: ({ isDragActive, isReducedMotion }: CardPresenceContext) => {
    if (isDragActive) return { opacity: 0, transition: { duration: 0 } }
    if (isReducedMotion) return { opacity: 0 }
    return { opacity: 0, height: 0, paddingBottom: 0, overflow: 'hidden' }
  },
}

type SortableCardProps = {
  card: Card
  client: Client | undefined
  assignees: AvatarStackPerson[]
  taskProgress: TaskProgress | undefined
  columnStatus: ColumnStatus | undefined
  overdueDayCount: number | undefined
  cover: CardCoverImage | undefined
  presenceContext: CardPresenceContext
  onOpen: (cardId: string) => void
}

export function SortableCard({
  card,
  client,
  assignees,
  taskProgress,
  columnStatus,
  overdueDayCount,
  cover,
  presenceContext,
  onOpen,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    transition: { duration: 250, easing: fluidEaseCss },
  })

  return (
    // The list item animates entering, leaving and reordering. The inner element is moved by dnd-kit while dragging.
    <motion.li
      layout={presenceContext.isDragActive ? false : 'position'}
      custom={presenceContext}
      variants={cardPresenceVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="pb-2"
    >
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="touch-manipulation rounded-card outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-accent/40"
        aria-label={boards.card.ariaLabel(card.title)}
        {...attributes}
        {...listeners}
        onClick={() => onOpen(card.id)}
        onKeyDown={(event) => {
          // Enter opens the card. Space is left to the keyboard sensor for dragging.
          if (event.key === 'Enter') {
            event.preventDefault()
            onOpen(card.id)
            return
          }
          listeners?.onKeyDown?.(event)
        }}
      >
        <CardContent
          card={card}
          client={client}
          assignees={assignees}
          taskProgress={taskProgress}
          columnStatus={columnStatus}
          overdueDayCount={overdueDayCount}
          cover={cover}
          appearance={isDragging ? 'placeholder' : 'default'}
        />
      </div>
    </motion.li>
  )
}
