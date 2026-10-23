import type { ColumnStatus } from '../types/board'
import type { BoardColumn } from '../types/database'

export function getColumnStatuses(columns: BoardColumn[]): Map<string, ColumnStatus> {
  return new Map(columns.map((column) => [column.id, { name: column.name, color: column.color }]))
}
