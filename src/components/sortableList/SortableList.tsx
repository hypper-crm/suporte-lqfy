import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ReactNode } from 'react'
import { positionBetween } from '../../lib/cardPosition'
import { SortableListItem, type DragHandleProps } from './SortableListItem'

type SortableListProps<Item extends { id: string; position: number }> = {
  // Sorted by position.
  items: Item[]
  ariaLabel: string
  // Receives the fractional position between the item's new neighbors.
  onMove: (itemId: string, position: number) => void
  renderItem: (item: Item, dragHandleProps: DragHandleProps) => ReactNode
}

export function SortableList<Item extends { id: string; position: number }>({
  items,
  ariaLabel,
  onMove,
  renderItem,
}: SortableListProps<Item>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const itemIds = items.map((item) => item.id)
    const activeIndex = itemIds.indexOf(String(active.id))
    const overIndex = itemIds.indexOf(String(over.id))
    if (activeIndex < 0 || overIndex < 0) return

    const reorderedItems = arrayMove(items, activeIndex, overIndex)
    onMove(String(active.id), positionBetween(reorderedItems[overIndex - 1]?.position, reorderedItems[overIndex + 1]?.position))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ul aria-label={ariaLabel} className="flex flex-col gap-1.5">
          {items.map((item) => (
            <SortableListItem key={item.id} id={item.id}>
              {(dragHandleProps) => renderItem(item, dragHandleProps)}
            </SortableListItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
