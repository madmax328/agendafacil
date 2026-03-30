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

// Format date in pt-BR
export function formatDate(date: Date | string, pattern = "dd 'de' MMMM 'de' yyyy"): string {
  return format(new Date(date), pattern, { locale: ptBR })
}

// Format time
export function formatTime(date: Date | string): string {
  return format(new Date(date), 'HH:mm', { locale: ptBR })
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
