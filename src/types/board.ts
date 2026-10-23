import type { Board, BoardColumn, Card, CardPriority, CardRequestType, CardTask } from './database'

export type AppScreen = Board | 'clients' | 'stepSettings'

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
  assigneeId: string | null
  priority: CardPriority | null
  requestType: CardRequestType | null
}
