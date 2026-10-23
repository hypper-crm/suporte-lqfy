import type { BoardColumn, Card } from '../types/database'
import { daysUntil } from './elapsedTime'

export type BoardSummary = {
  openCount: number
  doneCount: number
  overdueCount: number
}

// `columns` must be sorted by position. Cards in the last column are done, every other card is open.
export function findLastColumnId(columns: BoardColumn[]): string | undefined {
  return columns.at(-1)?.id
}

// Whole days since the card's start date when the card is overdue, otherwise null.
// An open card is overdue when its start date is more than `overdueAfterDays` days before today.
export function getOverdueDayCount(card: Card, isOpen: boolean, overdueAfterDays: number, today = new Date()): number | null {
  if (!isOpen || !card.start_date) return null
  const daysUntilStart = daysUntil(card.start_date, today)
  if (daysUntilStart === null) return null
  const daysSinceStart = -daysUntilStart
  return daysSinceStart > overdueAfterDays ? daysSinceStart : null
}

// Days overdue per card id. Cards that are not overdue are missing from the map.
export function getOverdueDayCounts(columns: BoardColumn[], cards: Card[], overdueAfterDays: number, today = new Date()): Map<string, number> {
  const lastColumnId = findLastColumnId(columns)
  const overdueDayCounts = new Map<string, number>()
  for (const card of cards) {
    const dayCount = getOverdueDayCount(card, card.column_id !== lastColumnId, overdueAfterDays, today)
    if (dayCount !== null) overdueDayCounts.set(card.id, dayCount)
  }
  return overdueDayCounts
}

export function summarizeBoard(columns: BoardColumn[], cards: Card[], overdueDayCounts: Map<string, number>): BoardSummary {
  const lastColumnId = findLastColumnId(columns)
  const doneCount = cards.filter((card) => card.column_id === lastColumnId).length

  return {
    openCount: cards.length - doneCount,
    doneCount,
    overdueCount: overdueDayCounts.size,
  }
}
