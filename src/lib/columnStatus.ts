import type { ColumnStatus, ColumnStatusTone } from '../types/board'
import type { BoardColumn } from '../types/database'

function toneForIndex(index: number, columnCount: number): ColumnStatusTone {
  if (index === 0) return 'neutral'
  if (index === columnCount - 1) return 'success'
  return 'warning'
}

// `columns` must be sorted by position.
export function getColumnStatuses(columns: BoardColumn[]): Map<string, ColumnStatus> {
  return new Map(columns.map((column, index) => [column.id, { name: column.name, tone: toneForIndex(index, columns.length) }]))
}
