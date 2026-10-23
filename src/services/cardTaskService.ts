import { serviceErrors } from '../i18n/pt-BR'
import { supabase } from '../lib/supabase'
import type { CardTaskCompletion, CardTaskRealtimeHandlers, NewCardTaskInput } from '../types/checklist'
import type { CardTask } from '../types/database'
import { subscribeToTableChanges } from './realtimeChannel'
import { listStepTemplates } from './stepTemplateService'

const cardTaskFields = 'id, card_id, title, position, is_done, completed_at, completed_by'

// Supabase returns at most 1000 rows per request, so all tasks are read page by page.
const pageSize = 1000

function optionalString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function toCardTask(record: Record<string, unknown>): CardTask {
  return {
    id: String(record.id),
    card_id: String(record.card_id),
    title: String(record.title ?? ''),
    position: Number(record.position),
    is_done: record.is_done === true,
    completed_at: optionalString(record.completed_at),
    completed_by: optionalString(record.completed_by),
  }
}

// Only implementation cards have tasks, so this returns the checklists of the whole implementation board.
export async function listAllCardTasks(): Promise<CardTask[]> {
  const tasks: CardTask[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('card_tasks')
      .select(cardTaskFields)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)
    if (error) throw new Error(serviceErrors.tasksLoad)
    tasks.push(...data.map(toCardTask))
    if (data.length < pageSize) return tasks
  }
}

// Copies the current implementation steps into the checklist of a new card, keeping their order.
export async function copyStepTemplatesToCard(cardId: string): Promise<CardTask[]> {
  const stepTemplates = await listStepTemplates()
  if (stepTemplates.length === 0) return []
  const { data, error } = await supabase
    .from('card_tasks')
    .insert(stepTemplates.map(({ title, position }) => ({ card_id: cardId, title, position })))
    .select(cardTaskFields)
  if (error) throw new Error(serviceErrors.checklistCopy)
  return data.map(toCardTask)
}

export async function createCardTask({ cardId, title, position }: NewCardTaskInput): Promise<CardTask> {
  const { data, error } = await supabase
    .from('card_tasks')
    .insert({ card_id: cardId, title, position })
    .select(cardTaskFields)
    .single()
  if (error) throw new Error(serviceErrors.taskCreate)
  return toCardTask(data)
}

async function updateCardTask(taskId: string, values: Record<string, unknown>): Promise<CardTask> {
  const { data, error } = await supabase
    .from('card_tasks')
    .update(values)
    .eq('id', taskId)
    .select(cardTaskFields)
    .maybeSingle()
  if (error) throw new Error(serviceErrors.taskSave)
  // An update blocked by row level security or on a deleted task returns no row instead of an error.
  if (!data) throw new Error(serviceErrors.taskSaveMissing)
  return toCardTask(data)
}

export function setCardTaskCompletion(taskId: string, { isDone, completedAt, completedBy }: CardTaskCompletion): Promise<CardTask> {
  return updateCardTask(taskId, { is_done: isDone, completed_at: completedAt, completed_by: completedBy })
}

export function renameCardTask(taskId: string, title: string): Promise<CardTask> {
  return updateCardTask(taskId, { title })
}

export function moveCardTask(taskId: string, position: number): Promise<CardTask> {
  return updateCardTask(taskId, { position })
}

export async function deleteCardTask(taskId: string): Promise<void> {
  const { data, error } = await supabase.from('card_tasks').delete().eq('id', taskId).select('id')
  if (error) throw new Error(serviceErrors.taskDelete)
  if (data.length === 0) throw new Error(serviceErrors.taskDeleteMissing)
}

export async function deleteTasksForCard(cardId: string): Promise<void> {
  const { error } = await supabase.from('card_tasks').delete().eq('card_id', cardId)
  if (error) throw new Error(serviceErrors.cardDelete)
}

export function subscribeToCardTaskChanges(handlers: CardTaskRealtimeHandlers): () => void {
  return subscribeToTableChanges({ table: 'card_tasks', toRow: toCardTask, handlers })
}
