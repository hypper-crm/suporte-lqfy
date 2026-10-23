import { CalendarDays } from 'lucide-react'
import type { TaskProgress } from '../../hooks/useCardTasks'
import { boards } from '../../i18n/pt-BR'
import { formatDate } from '../../lib/formatting'
import type { Card, Client, Profile } from '../../types/database'
import { Avatar } from '../ui/Avatar'
import { CardTaskProgress } from './CardTaskProgress'
import { SupportCardLabels } from './SupportCardLabels'

type CardAppearance = 'default' | 'dragOverlay' | 'placeholder'

const appearanceClassNames: Record<CardAppearance, string> = {
  default:
    'border-border bg-elevated shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-[border-color,transform,box-shadow] duration-200 ease-fluid hover:border-border-strong hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)] motion-safe:hover:-translate-y-0.5',
  dragOverlay: 'animate-card-lift border-border-strong bg-elevated',
  placeholder: 'border-dashed border-border-strong bg-transparent',
}

type CardContentProps = {
  card: Card
  client: Client | undefined
  assignee: Profile | undefined
  // Implementation cards only.
  taskProgress?: TaskProgress
  appearance?: CardAppearance
}

export function CardContent({ card, client, assignee, taskProgress, appearance = 'default' }: CardContentProps) {
  const startDate = formatDate(card.start_date)

  return (
    <div
      data-drag-lift={appearance === 'dragOverlay' ? '' : undefined}
      className={`flex flex-col gap-3 rounded-card border p-3.5 text-left ${appearanceClassNames[appearance]}`}
    >
      {/* The placeholder keeps the card's size but hides its content. */}
      <div className={`flex flex-col gap-3 ${appearance === 'placeholder' ? 'invisible' : ''}`}>
        {card.board === 'support' && <SupportCardLabels priority={card.priority} requestType={card.request_type} />}
        <div className="flex flex-col gap-1">
          <p className="text-sm leading-snug font-medium break-words">{card.title}</p>
          <p className={`truncate text-xs ${client ? 'text-muted' : 'text-subtle'}`}>{client?.name ?? boards.card.noClient}</p>
        </div>
        {card.board === 'implementation' && taskProgress && taskProgress.totalCount > 0 && (
          <CardTaskProgress progress={taskProgress} />
        )}
        <div className="flex items-center justify-between gap-2 border-t border-border pt-2.5">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            {startDate ?? <span className="text-subtle">{boards.card.noStartDate}</span>}
          </span>
          {card.assignee_id ? (
            <Avatar size="small" fullName={assignee?.full_name} title={assignee?.full_name ?? boards.card.unknownTeamMember} />
          ) : (
            <span className="text-[11px] text-subtle">{boards.card.unassigned}</span>
          )}
        </div>
      </div>
    </div>
  )
}
