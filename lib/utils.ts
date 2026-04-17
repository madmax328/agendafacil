import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Convert a stored UTC timestamp to a naive-local Date so that
// "2024-04-17T17:00:00.000Z" always displays as "17:00" regardless
// of the environment timezone (server UTC or client UTC+N).
export function toNaiveLocal(date: Date | string): Date {
  const d = new Date(date)
  return new Date(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(),
  )
}

// Format date in pt-BR
export function formatDate(date: Date | string, pattern = "dd 'de' MMMM 'de' yyyy"): string {
  return format(toNaiveLocal(date), pattern, { locale: ptBR })
}

// Format time — always reads the UTC clock (timezone-naive)
export function formatTime(date: Date | string): string {
  return format(toNaiveLocal(date), 'HH:mm', { locale: ptBR })
}

// Generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Plan limits
export const PLAN_LIMITS = {
  FREE: {
    appointments: 30,
    whatsapp: false,
    services: 1,
    pix: false,
    analytics: false,
  },
  STARTER: {
    appointments: 200,
    whatsapp: true,
    services: Infinity,
    pix: false,
    analytics: false,
  },
  PRO: {
    appointments: Infinity,
    whatsapp: true,
    services: Infinity,
    pix: true,
    analytics: true,
  },
} as const
