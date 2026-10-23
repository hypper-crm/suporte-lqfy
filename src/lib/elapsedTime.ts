import { boards } from '../i18n/pt-BR'

const millisecondsPerDay = 24 * 60 * 60 * 1000

// Whole days from today to the start date: positive in the future, negative in the past.
// Dates are compared as local calendar days, so the time of day and daylight saving changes do not matter.
export function daysUntil(isoDate: string, today = new Date()): number | null {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return null
  const startDay = Date.UTC(year, month - 1, day)
  const currentDay = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((startDay - currentDay) / millisecondsPerDay)
}

// Null when the card has no start date.
export function formatElapsedTime(startDate: string | null, today = new Date()): string | null {
  if (!startDate) return null
  const dayCount = daysUntil(startDate, today)
  if (dayCount === null) return null
  if (dayCount > 0) return boards.card.startsIn(dayCount)
  if (dayCount === 0) return boards.card.startsToday
  return boards.card.daysAgo(-dayCount)
}
