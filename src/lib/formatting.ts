import { common } from '../i18n/pt-BR'

const locale = 'pt-BR'

export function getInitials(fullName: string | null | undefined): string {
  const words = (fullName ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  const firstInitial = words[0][0]
  const lastInitial = words.length > 1 ? words[words.length - 1][0] : ''
  return `${firstInitial}${lastInitial}`.toUpperCase()
}

const dateFormat = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })

const timeFormat = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false })

// Dates are stored as YYYY-MM-DD. They are parsed as local dates so the day does not shift with the time zone.
export function formatDate(isoDate: string | null): string | null {
  if (!isoDate) return null
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return null
  return dateFormat.format(new Date(year, month - 1, day))
}

// Timestamps are shown as dd/mm/yyyy às HH:mm, in local time.
export function formatDateTime(isoTimestamp: string | null): string | null {
  if (!isoTimestamp) return null
  const date = new Date(isoTimestamp)
  if (Number.isNaN(date.getTime())) return null
  return `${dateFormat.format(date)} às ${timeFormat.format(date)}`
}

// Two decimals with a decimal comma, for example 4,50.
export function formatDecimal(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

export function formatRate(rate: number | null): string {
  return rate === null ? common.emptyValue : `${formatDecimal(rate)}%`
}

const bytesPerKilobyte = 1024
const bytesPerMegabyte = 1024 * 1024

export function formatFileSize(sizeInBytes: number | null): string {
  if (sizeInBytes === null) return common.emptyValue
  if (sizeInBytes < bytesPerMegabyte) return `${Math.max(sizeInBytes / bytesPerKilobyte, 0.1).toFixed(1).replace('.', ',')} KB`
  return `${(sizeInBytes / bytesPerMegabyte).toFixed(1).replace('.', ',')} MB`
}
