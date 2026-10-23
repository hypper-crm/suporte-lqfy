import type { Board, BoardColumn, BoardColumnColor, Card, CardAssignee, CardPriority, CardRequestType, CardTask } from './database'

export type AppScreen = Board | 'clients' | 'stepSettings' | 'deadlineSettings' | 'profile'

// Values of a new card chosen in the app. Fields left undefined are not set.
export type NewCardFields = {
  columnId: string
  title: string
  clientId: string | null
  startDate?: string | null
  description?: string | null
  assigneeIds?: string[]
}

export type NewCardInput = NewCardFields & {
  board: Board
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

// The image attachment shown as the card's cover, or null for no cover.
export type CardCoverInput = {
  coverAttachmentId: string | null
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

export type ColumnStatus = {
  name: string
  color: BoardColumnColor
}
