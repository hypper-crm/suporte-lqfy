import { clients } from '../i18n/pt-BR'
import { formatDecimal } from './formatting'
import { isValidWebsite } from './website'
import type { ClientInput } from '../types/client'
import type { Client } from '../types/database'

export type ClientFormValues = {
  name: string
  email: string
  niche: string
  payInRate: string
  payOutRate: string
  website: string
}

export type ClientFormErrors = Partial<Record<keyof ClientFormValues, string>>

export const maximumClientNameLength = 200

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Up to three integer digits and up to two decimals. A comma is accepted as the decimal separator.
const ratePattern = /^\d{1,3}([.,]\d{1,2})?$/

const rateErrorMessage = clients.validation.rateInvalid

export const emptyClientFormValues: ClientFormValues = { name: '', email: '', niche: '', payInRate: '', payOutRate: '', website: '' }

export function toClientFormValues(client: Client): ClientFormValues {
  return {
    name: client.name,
    email: client.email ?? '',
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

  if (values.email.trim() && !emailPattern.test(values.email.trim())) {
    errors.email = clients.validation.emailInvalid
  }

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
    email: values.email.trim() || null,
    niche: values.niche.trim() || null,
    payInRate: parseRate(values.payInRate),
    payOutRate: parseRate(values.payOutRate),
    website: values.website.trim() || null,
  }
}
