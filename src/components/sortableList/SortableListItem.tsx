import type { DraggableAttributes, DraggableSyntheticListeners } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'
import { fluidEaseCss } from '../ui/motionPresets'

export type DragHandleProps = {
  attributes: DraggableAttributes
  listeners: DraggableSyntheticListeners
}

type SortableListItemProps = {
  id: string
  children: (dragHandleProps: DragHandleProps) => ReactNode
}

// Only the drag handle starts a drag, so the rest of the row stays clickable and editable.
export function SortableListItem({ id, children }: SortableListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    transition: { duration: 250, easing: fluidEaseCss },
  })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative rounded-card border bg-elevated transition-[border-color,box-shadow] duration-200 ease-fluid ${
        isDragging ? 'z-10 border-border-strong shadow-[0_16px_32px_-16px_rgba(0,0,0,0.8)]' : 'border-border hover:border-border-strong'
      }`}
    >
      {children({ attributes, listeners })}
    </li>
  )
}
