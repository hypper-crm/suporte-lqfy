import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { BoardColumnRealtimeHandlers } from '../types/board'
import type { Board, BoardColumn, BoardColumnColor } from '../types/database'
import { subscribeToTableChanges } from './realtimeChannel'

const boardColumnFields = 'id, board, name, position, color'

const boardColumnColors: BoardColumnColor[] = ['neutral', 'blue', 'amber', 'green', 'red']

// Unknown colors are shown as neutral.
function toBoardColumnColor(value: unknown): BoardColumnColor {
  return boardColumnColors.includes(value as BoardColumnColor) ? (value as BoardColumnColor) : 'neutral'
}

function toBoardColumn(record: Record<string, unknown>): BoardColumn {
  return {
    id: String(record.id),
    board: record.board as Board,
    name: String(record.name ?? ''),
    position: Number(record.position),
    color: toBoardColumnColor(record.color),
  }
}

export async function fetchBoardColumns(board: Board): Promise<BoardColumn[]> {
  const { data, error } = await supabase
    .from('board_columns')
    .select(boardColumnFields)
    .eq('board', board)
    .order('position', { ascending: true })
  if (error) throw new Error(serviceErrors.columnsLoad)
  return data.map(toBoardColumn)
}

export function subscribeToBoardColumnChanges(board: Board, handlers: BoardColumnRealtimeHandlers): () => void {
  return subscribeToTableChanges({
    table: 'board_columns',
    filter: `board=eq.${board}`,
    toRow: toBoardColumn,
    handlers,
  })
}
