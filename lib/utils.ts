import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-CH', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export const UNIT_LABELS: Record<string, string> = {
  CUISINE: 'Cuisine',
  BOULANGERIE: 'Boulangerie',
  PIZZERIA: 'Pizzeria',
}

export const UNIT_COLORS: Record<string, string> = {
  CUISINE: 'orange',
  BOULANGERIE: 'amber',
  PIZZERIA: 'red',
}

export const UNIT_BG: Record<string, string> = {
  CUISINE: 'bg-orange-500',
  BOULANGERIE: 'bg-amber-500',
  PIZZERIA: 'bg-red-500',
}

export const UNIT_TEXT: Record<string, string> = {
  CUISINE: 'text-orange-600',
  BOULANGERIE: 'text-amber-600',
  PIZZERIA: 'text-red-600',
}

export const UNIT_BORDER: Record<string, string> = {
  CUISINE: 'border-orange-200',
  BOULANGERIE: 'border-amber-200',
  PIZZERIA: 'border-red-200',
}

export const UNIT_LIGHT: Record<string, string> = {
  CUISINE: 'bg-orange-50',
  BOULANGERIE: 'bg-amber-50',
  PIZZERIA: 'bg-red-50',
}
