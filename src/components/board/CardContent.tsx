import { CalendarDays } from 'lucide-react'
import type { TaskProgress } from '../../hooks/useCardTasks'
import { boards } from '../../i18n/pt-BR'
import { formatDate } from '../../lib/formatting'
import type { ColumnStatus } from '../../types/board'
import type { Card, Client } from '../../types/database'
import type { AvatarStackPerson } from '../ui/AvatarStack'
import { CardAssignees } from './CardAssignees'
import { CardTaskProgress } from './CardTaskProgress'
import { ColumnStatusBadge } from './ColumnStatusBadge'
import { ElapsedTimeBadge } from './ElapsedTimeBadge'
import { SupportCardLabels } from './SupportCardLabels'

type CardAppearance = 'default' | 'dragOverlay' | 'placeholder'

const appearanceClassNames: Record<CardAppearance, string> = {
  default:
    'border-border bg-elevated shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-[border-color,transform,box-shadow] duration-200 ease-fluid hover:border-border-strong hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)] motion-safe:hover:-translate-y-0.5',
  dragOverlay: 'animate-card-lift border-border-strong bg-elevated',
  placeholder: 'border-dashed border-border-strong bg-transparent',
}

const noTaskProgress: TaskProgress = { doneCount: 0, totalCount: 0 }

export type CardContentProps = {
  card: Card
  client: Client | undefined
  assignees: AvatarStackPerson[]
  // Implementation cards only.
  taskProgress?: TaskProgress
  // Implementation cards only. The column the card is shown in.
  columnStatus?: ColumnStatus
  appearance?: CardAppearance
}

type CardBodyProps = Omit<CardContentProps, 'appearance'>

function SupportCardBody({ card, client, assignees }: CardBodyProps) {
  const startDate = formatDate(card.start_date)

  return (
    <>
      <SupportCardLabels priority={card.priority} requestType={card.request_type} />
      <div className="flex flex-col gap-1">
        <p className="text-sm leading-snug font-medium break-words">{card.title}</p>
        <p className={`truncate text-xs ${client ? 'text-muted' : 'text-subtle'}`}>{client?.name ?? boards.card.noClient}</p>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted">
          <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
          {startDate ?? <span className="truncate text-subtle">{boards.card.noStartDate}</span>}
        </span>
        <CardAssignees assignees={assignees} />
      </div>
    </>
  )
}

function ImplementationCardBody({ card, client, assignees, taskProgress, columnStatus }: CardBodyProps) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="truncate text-[15px] leading-snug font-semibold">{client?.name ?? card.title}</p>
        {card.description && <p className="line-clamp-2 text-xs leading-relaxed break-words text-muted">{card.description}</p>}
      </div>
      {(card.start_date || columnStatus) && (
        <div className="flex min-w-0 items-center gap-1.5">
          <ElapsedTimeBadge startDate={card.start_date} />
          {columnStatus && <ColumnStatusBadge status={columnStatus} />}
        </div>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
        <CardTaskProgress progress={taskProgress ?? noTaskProgress} />
        <CardAssignees assignees={assignees} />
      </div>
    </>
  )
}

export function CardContent({ appearance = 'default', ...bodyProps }: CardContentProps) {
  return (
    <div
      data-drag-lift={appearance === 'dragOverlay' ? '' : undefined}
      className={`flex flex-col rounded-card border p-3.5 text-left ${appearanceClassNames[appearance]}`}
    >
      {/* The placeholder keeps the card's size but hides its content. */}
      <div className={`flex flex-col gap-3 ${appearance === 'placeholder' ? 'invisible' : ''}`}>
        {bodyProps.card.board === 'support' ? <SupportCardBody {...bodyProps} /> : <ImplementationCardBody {...bodyProps} />}
      </div>
    </div>
  )
}
