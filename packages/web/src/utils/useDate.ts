import { format } from 'date-fns'

export const formatDate = (date: Date | string | number): string => {
  return format(new Date(date), 'MMM dd, yyyy')
}
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'decimal',
  }).format(value)

export const formatCompact = (v: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
