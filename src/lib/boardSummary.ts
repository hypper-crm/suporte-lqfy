import type { BoardColumn, Card } from '../types/database'

export type BoardSummary = {
  openCardCount: number
  unassignedOpenCardCount: number
  doneThisWeekCount: number
}

const doneColumnNamePattern =
  /\b(done|complete|completed|closed|resolved|finished|live|conclu[ií]d[oa]s?|finalizad[oa]s?|resolvid[oa]s?|fechad[oa]s?|encerrad[oa]s?|entregues?)(?![\p{L}\p{N}])/iu

// Columns whose name reads as finished work. Without one, the last column is treated as the done column.
export function findDoneColumnIds(columns: BoardColumn[]): Set<string> {
  const namedDoneColumns = columns.filter((column) => doneColumnNamePattern.test(column.name))
  if (namedDoneColumns.length > 0) return new Set(namedDoneColumns.map((column) => column.id))
  const lastColumn = columns.reduce<BoardColumn | undefined>(
    (latest, column) => (!latest || column.position > latest.position ? column : latest),
    undefined,
  )
  return new Set(lastColumn ? [lastColumn.id] : [])
}

// Weeks start on Monday at midnight, local time.
function startOfCurrentWeek(now: Date): Date {
  const daysSinceMonday = (now.getDay() + 6) % 7
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday)
}

export function summarizeBoard(
  columns: BoardColumn[],
  cards: Card[],
  assigneeIdsByCardId: Map<string, string[]>,
  now = new Date(),
): BoardSummary {
  const doneColumnIds = findDoneColumnIds(columns)
  const weekStartTime = startOfCurrentWeek(now).getTime()
  const openCards = cards.filter((card) => !doneColumnIds.has(card.column_id))
  const doneCards = cards.filter((card) => doneColumnIds.has(card.column_id))

  return {
    openCardCount: openCards.length,
    unassignedOpenCardCount: openCards.filter((card) => !assigneeIdsByCardId.has(card.id)).length,
    doneThisWeekCount: doneCards.filter((card) => new Date(card.updated_at).getTime() >= weekStartTime).length,
  }
}
