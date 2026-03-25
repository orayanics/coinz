import { format } from 'date-fns'

export const formatDate = (date: Date | string | number): string => {
  return format(new Date(date), 'MMM dd, yyyy')
}
