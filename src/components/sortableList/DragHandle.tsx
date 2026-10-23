import { GripVertical } from 'lucide-react'
import { common } from '../../i18n/pt-BR'
import type { DragHandleProps as DragHandleBindings } from './SortableListItem'

type DragHandleProps = DragHandleBindings & {
  isDisabled?: boolean
}

export function DragHandle({ attributes, listeners, isDisabled = false }: DragHandleProps) {
  return (
    <button
      type="button"
      {...attributes}
      {...(isDisabled ? {} : listeners)}
      aria-label={common.dragToReorder}
      title={common.dragToReorder}
      disabled={isDisabled}
      className="flex size-11 shrink-0 touch-none md:size-7 items-center justify-center rounded-md text-subtle outline-none transition-colors duration-200 ease-fluid hover:bg-hover hover:text-muted focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40"
    >
      <GripVertical aria-hidden="true" className="size-4" />
    </button>
  )
}
