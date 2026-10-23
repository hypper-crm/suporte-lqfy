import { cardDetails } from '../i18n/pt-BR'
import type { CardUpdateInput } from '../types/board'
import type { Card, CardPriority, CardRequestType } from '../types/database'

export type CardFormValues = {
  title: string
  description: string
  startDate: string
  clientId: string
  assigneeId: string
  // Support cards only. An empty string means not set.
  priority: CardPriority | ''
  requestType: CardRequestType | ''
}

export type CardFormField = keyof CardFormValues

export const maximumCardTitleLength = 200

export const cardPriorityOptions: CardPriority[] = ['low', 'medium', 'high', 'urgent']

export const cardRequestTypeOptions: CardRequestType[] = ['question', 'bug', 'request', 'other']

const cardFormFields: CardFormField[] = ['title', 'description', 'startDate', 'clientId', 'assigneeId', 'priority', 'requestType']

export function toCardFormValues(card: Card): CardFormValues {
  return {
    title: card.title,
    description: card.description ?? '',
    startDate: card.start_date ?? '',
    clientId: card.client_id ?? '',
    assigneeId: card.assignee_id ?? '',
    priority: card.priority ?? '',
    requestType: card.request_type ?? '',
  }
}

export function areCardFormValuesEqual(first: CardFormValues, second: CardFormValues): boolean {
  return cardFormFields.every((field) => first[field] === second[field])
}

export function validateCardTitle(title: string): string | undefined {
  if (!title.trim()) return cardDetails.validation.titleRequired
  if (title.trim().length > maximumCardTitleLength) return cardDetails.validation.titleTooLong(maximumCardTitleLength)
  return undefined
}

// Call only after validateCardTitle returned no error.
export function toCardUpdateInput(values: CardFormValues): CardUpdateInput {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    startDate: values.startDate || null,
    clientId: values.clientId || null,
    assigneeId: values.assigneeId || null,
    priority: values.priority || null,
    requestType: values.requestType || null,
  }
}
