import { KanbanSquare } from 'lucide-react'
import { productName } from '../../i18n/pt-BR'

type ProductMarkProps = {
  isCompact?: boolean
}

export function ProductMark({ isCompact = false }: ProductMarkProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-card border border-accent/30 bg-accent/10 text-accent">
        <KanbanSquare aria-hidden="true" className="size-4" />
      </span>
      <span className={`leading-tight font-semibold ${isCompact ? 'text-sm' : 'text-[13px]'}`}>{productName}</span>
    </div>
  )
}
