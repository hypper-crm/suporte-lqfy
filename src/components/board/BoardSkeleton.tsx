import { boards } from '../../i18n/pt-BR'
import { Skeleton } from '../ui/Skeleton'

const placeholderColumnCardCounts = [3, 2, 4, 1]

export function BoardSkeleton() {
  return (
    <div role="status" aria-label={boards.loading} className="flex min-h-0 flex-1 flex-col gap-5 md:gap-6">
      <div className="flex gap-2 overflow-hidden px-4 md:px-8">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-14 w-36 shrink-0 rounded-card" />
        ))}
      </div>
      <div className="flex gap-4 overflow-hidden px-4 md:px-8">
        {placeholderColumnCardCounts.map((cardCount, columnIndex) => (
          <div key={columnIndex} className="flex w-[85vw] shrink-0 flex-col md:w-72 gap-2 rounded-card border border-border bg-surface/60 p-2">
            <Skeleton className="m-1.5 h-4 w-28" />
            {Array.from({ length: cardCount }, (_, cardIndex) => (
              <Skeleton key={cardIndex} className="h-[92px] rounded-card" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
