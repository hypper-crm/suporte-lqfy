import { clients } from '../i18n/pt-BR'
import { formatDecimal } from './formatting'
import { isValidWebsite } from './website'
import type { ClientInput } from '../types/client'
import type { Client } from '../types/database'

// One row of the emails list. The key identifies the row while it is edited.
export type ClientEmailFormRow = {
  key: string
  // Null for an email that was not saved yet.
  id: string | null
  email: string
}

export type ClientFormValues = {
  name: string
  emails: ClientEmailFormRow[]
  niche: string
  payInRate: string
  payOutRate: string
  website: string
}

export type ClientTextField = Exclude<keyof ClientFormValues, 'emails'>

export type ClientFormErrors = Partial<Record<ClientTextField, string>> & {
  // Keyed by the row key.
  emails?: Record<string, string>
}

export const maximumClientNameLength = 200

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Up to three integer digits and up to two decimals. A comma is accepted as the decimal separator.
const ratePattern = /^\d{1,3}([.,]\d{1,2})?$/

const rateErrorMessage = clients.validation.rateInvalid

export const emptyClientFormValues: ClientFormValues = { name: '', emails: [], niche: '', payInRate: '', payOutRate: '', website: '' }

export function createEmailFormRow(): ClientEmailFormRow {
  return { key: crypto.randomUUID(), id: null, email: '' }
}

// Emails are compared without surrounding spaces and ignoring case.
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function toClientFormValues(client: Client): ClientFormValues {
  return {
    name: client.name,
    emails: client.emails.map((email) => ({ key: email.id, id: email.id, email: email.email })),
    niche: client.niche ?? '',
    payInRate: client.pay_in_rate === null ? '' : formatDecimal(client.pay_in_rate),
    payOutRate: client.pay_out_rate === null ? '' : formatDecimal(client.pay_out_rate),
    website: client.website ?? '',
  }
}

function parseRate(value: string): number | null {
  return value.trim() ? Number(value.trim().replace(',', '.')) : null
}

function validateRate(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (!ratePattern.test(trimmed)) return rateErrorMessage
  const rate = parseRate(trimmed)
  if (rate === null || rate < 0 || rate > 100) return rateErrorMessage
  return undefined
}

export function validateClientForm(values: ClientFormValues): ClientFormErrors {
  const errors: ClientFormErrors = {}

  if (!values.name.trim()) {
    errors.name = clients.validation.nameRequired
  } else if (values.name.trim().length > maximumClientNameLength) {
    errors.name = clients.validation.nameTooLong(maximumClientNameLength)
  }

  // Empty rows are ignored when saving.
  const emailErrors: Record<string, string> = {}
  const seenEmails = new Set<string>()
  for (const row of values.emails) {
    const normalized = normalizeEmail(row.email)
    if (!normalized) continue
    if (!emailPattern.test(normalized)) {
      emailErrors[row.key] = clients.validation.emailInvalid
    } else if (seenEmails.has(normalized)) {
      emailErrors[row.key] = clients.validation.emailDuplicate
    }
    seenEmails.add(normalized)
  }
  if (Object.keys(emailErrors).length > 0) errors.emails = emailErrors

  const payInRateError = validateRate(values.payInRate)
  if (payInRateError) errors.payInRate = payInRateError

  const payOutRateError = validateRate(values.payOutRate)
  if (payOutRateError) errors.payOutRate = payOutRateError

  if (values.website.trim() && !isValidWebsite(values.website.trim())) {
    errors.website = clients.validation.websiteInvalid
  }

  return errors
}

// Call only after validateClientForm returned no errors.
export function toClientInput(values: ClientFormValues): ClientInput {
  return {
    name: values.name.trim(),
    emails: values.emails.filter((row) => row.email.trim()).map((row) => ({ id: row.id, email: row.email.trim() })),
    niche: values.niche.trim() || null,
    payInRate: parseRate(values.payInRate),
    payOutRate: parseRate(values.payOutRate),
    website: values.website.trim() || null,
  }
}
