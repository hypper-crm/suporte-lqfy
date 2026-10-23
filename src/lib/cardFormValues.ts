import { cardDetails } from '../i18n/pt-BR'
import type { CardDetailsInput, SavedCardDetails } from '../types/board'
import type { CardPriority, CardRequestType } from '../types/database'

export type CardFormValues = {
  title: string
  description: string
  startDate: string
  clientId: string
  // Sorted, so two lists with the same members compare as equal.
  assigneeIds: string[]
  // Support cards only. An empty string means not set.
  priority: CardPriority | ''
  requestType: CardRequestType | ''
}

export type CardFormField = keyof CardFormValues

export const maximumCardTitleLength = 200

export const cardPriorityOptions: CardPriority[] = ['low', 'medium', 'high', 'urgent']

export const cardRequestTypeOptions: CardRequestType[] = ['question', 'bug', 'request', 'other']

const textFields = ['title', 'description', 'startDate', 'clientId', 'priority', 'requestType'] as const satisfies CardFormField[]

export function sortAssigneeIds(assigneeIds: string[]): string[] {
  return [...assigneeIds].sort()
}

export function toCardFormValues({ card, assigneeIds }: SavedCardDetails): CardFormValues {
  return {
    title: card.title,
    description: card.description ?? '',
    startDate: card.start_date ?? '',
    clientId: card.client_id ?? '',
    assigneeIds: sortAssigneeIds(assigneeIds),
    priority: card.priority ?? '',
    requestType: card.request_type ?? '',
  }
}

export function areCardFormValuesEqual(first: CardFormValues, second: CardFormValues): boolean {
  return (
    textFields.every((field) => first[field] === second[field]) &&
    first.assigneeIds.length === second.assigneeIds.length &&
    first.assigneeIds.every((assigneeId, index) => assigneeId === second.assigneeIds[index])
  )
}

export function validateCardTitle(title: string): string | undefined {
  if (!title.trim()) return cardDetails.validation.titleRequired
  if (title.trim().length > maximumCardTitleLength) return cardDetails.validation.titleTooLong(maximumCardTitleLength)
  return undefined
}

// Call only after validateCardTitle returned no error.
export function toCardDetailsInput(values: CardFormValues): CardDetailsInput {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    startDate: values.startDate || null,
    clientId: values.clientId || null,
    assigneeIds: values.assigneeIds,
    priority: values.priority || null,
    requestType: values.requestType || null,
  }
}
