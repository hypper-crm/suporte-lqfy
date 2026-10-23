import type { RealtimeHandlers } from './board'
import type { CardTask, ImplementationStepTemplate } from './database'

export type NewCardTaskInput = {
  cardId: string
  title: string
  position: number
}

// Values written to `card_tasks` when a task is checked or unchecked.
export type CardTaskCompletion = {
  isDone: boolean
  completedAt: string | null
  completedBy: string | null
}

export type CardTaskRealtimeHandlers = RealtimeHandlers<CardTask>

export type StepTemplateRealtimeHandlers = RealtimeHandlers<ImplementationStepTemplate>
