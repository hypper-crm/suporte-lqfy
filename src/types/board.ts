import type { Board, BoardColumn, Card, CardAssignee, CardPriority, CardRequestType, CardTask } from './database'

export type AppScreen = Board | 'clients' | 'stepSettings' | 'profile'

export type NewCardInput = {
  board: Board
  columnId: string
  title: string
  clientId: string | null
  position: number
  createdBy: string
}

// An implementation card is created together with the checklist copied from the implementation steps.
export type CreatedCard = {
  card: Card
  tasks: CardTask[]
}

export type CardMove = {
  columnId: string
  position: number
}

export type RealtimeHandlers<Row> = {
  onUpsert: (row: Row) => void
  onDelete: (id: string) => void
  onConnectionChange: (isConnected: boolean) => void
}

export type BoardColumnRealtimeHandlers = RealtimeHandlers<BoardColumn>

export type CardRealtimeHandlers = RealtimeHandlers<Card>

// Values written to the `cards` table when saving the card details form.
export type CardUpdateInput = {
  title: string
  description: string | null
  startDate: string | null
  clientId: string | null
  priority: CardPriority | null
  requestType: CardRequestType | null
}

// Values saved from the card details form: the `cards` row plus the rows of `card_assignees`.
export type CardDetailsInput = CardUpdateInput & {
  assigneeIds: string[]
}

export type SavedCardDetails = {
  card: Card
  assigneeIds: string[]
}

// Realtime events of `card_assignees`, which has no id column.
export type CardAssigneeRealtimeHandlers = {
  onInsert: (row: CardAssignee) => void
  onDelete: (row: CardAssignee) => void
  onConnectionChange: (isConnected: boolean) => void
}

// Color of a column's status badge, from its place in the board: first, middle or last.
export type ColumnStatusTone = 'neutral' | 'warning' | 'success'

export type ColumnStatus = {
  name: string
  tone: ColumnStatusTone
}
