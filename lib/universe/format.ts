import { localeTag, type Locale, t } from '../i18n'

export function formatCompactNumber(value: number, locale: Locale = 'en'): string {
  return new Intl.NumberFormat(localeTag(locale), { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = units[0]
  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024
    unit = units[index]
  }
  return `${value.toFixed(value >= 100 ? 0 : value >= 10 ? 1 : 2)} ${unit}`
}

export function formatPercentage(value: number, locale: Locale = 'en'): string {
  return new Intl.NumberFormat(localeTag(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)
}

export function formatDate(value: string | null, locale: Locale = 'en'): string {
  if (!value) return t(locale, 'format.unknown')
  return new Intl.DateTimeFormat(localeTag(locale), { dateStyle: 'medium' }).format(new Date(value))
}
