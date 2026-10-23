import type { BoardColumn, Card } from '../types/database'

const positionStep = 1024

// Fractional positions: a moved card takes the midpoint between its neighbors, so no other card needs to change.
export function positionBetween(previousPosition: number | undefined, nextPosition: number | undefined): number {
  if (previousPosition === undefined && nextPosition === undefined) return positionStep
  if (previousPosition === undefined) return (nextPosition as number) - positionStep
  if (nextPosition === undefined) return previousPosition + positionStep
  return (previousPosition + nextPosition) / 2
}

export function positionAfterLast(items: { position: number }[]): number {
  const lastPosition = items.reduce<number | undefined>(
    (highest, item) => (highest === undefined || item.position > highest ? item.position : highest),
    undefined,
  )
  return positionBetween(lastPosition, undefined)
}

export function compareByPosition(first: { position: number; id: string }, second: { position: number; id: string }): number {
  return first.position - second.position || first.id.localeCompare(second.id)
}

export function sortColumns(columns: BoardColumn[]): BoardColumn[] {
  return [...columns].sort(compareByPosition)
}

export type CardIdsByColumn = Record<string, string[]>

export function groupCardIdsByColumn(columns: BoardColumn[], cards: Card[]): CardIdsByColumn {
  const grouped: CardIdsByColumn = Object.fromEntries(columns.map((column) => [column.id, [] as string[]]))
  for (const card of [...cards].sort(compareByPosition)) {
    grouped[card.column_id]?.push(card.id)
  }
  return grouped
}
