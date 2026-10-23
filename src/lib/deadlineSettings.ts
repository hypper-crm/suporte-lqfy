import { deadlineSettings } from '../i18n/pt-BR'

export const minimumOverdueAfterDays = 1

export const maximumOverdueAfterDays = 365

export type OverdueAfterDaysCheck = { isValid: true; days: number } | { isValid: false; errorMessage: string }

export function checkOverdueAfterDays(value: string): OverdueAfterDaysCheck {
  const days = Number(value.trim())
  if (!value.trim() || !Number.isInteger(days) || days < minimumOverdueAfterDays || days > maximumOverdueAfterDays) {
    return { isValid: false, errorMessage: deadlineSettings.invalidDays(minimumOverdueAfterDays, maximumOverdueAfterDays) }
  }
  return { isValid: true, days }
}
