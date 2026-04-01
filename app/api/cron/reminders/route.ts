import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage, whatsappTemplates, type WhatsAppCredentials } from '@/lib/whatsapp'
import { addHours, addDays, startOfDay, endOfDay, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── Auth helper ────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Cron] CRON_SECRET não está configurado!')
      return false
    }
    return true
  }

  return token === cronSecret
}

// ── Plan helpers ───────────────────────────────────────────────────────────────

function getCredentials(pro: {
  zapiInstanceId: string | null
  whatsappToken: string | null
  zapiClientToken: string | null
}): WhatsAppCredentials | null {
  if (!pro.zapiInstanceId || !pro.whatsappToken) return null
  return {
    instanceId: pro.zapiInstanceId,
    instanceToken: pro.whatsappToken,
    clientToken: pro.zapiClientToken ?? undefined,
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ReminderResult {
  appointmentId: string
  customerName: string
  type: 'J-1' | 'H-2'
  sent: boolean
  skipped?: string
}

// ── J-1: Lembrete dia anterior (apenas plano PRO) ─────────────────────────────

async function sendDayBeforeReminders(now: Date): Promise<ReminderResult[]> {
  const tomorrowStart = startOfDay(addDays(now, 1))
  const tomorrowEnd = endOfDay(addDays(now, 1))

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: tomorrowStart, lte: tomorrowEnd },
      status: { in: ['PENDING', 'CONFIRMED'] },
      reminderDayBefore: false,
      // Only PRO plan professionals get day-before reminders
      professional: { plan: 'PRO' },
    },
    include: {
      customer: true,
      service: true,
      professional: {
        select: {
          plan: true,
          businessName: true,
          address: true,
          city: true,
          state: true,
          zapiInstanceId: true,
          whatsappToken: true,
          zapiClientToken: true,
        },
      },
    },
  })

  const results: ReminderResult[] = []

  for (const appt of appointments) {
    const credentials = getCredentials(appt.professional)

    // Mark as sent regardless to avoid duplicate attempts
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminderDayBefore: true },
    })

    if (!credentials) {
      results.push({ appointmentId: appt.id, customerName: appt.customer.name, type: 'J-1', sent: false, skipped: 'sem credenciais Z-API' })
      continue
    }

    const address = [appt.professional.address, appt.professional.city, appt.professional.state]
      .filter(Boolean).join(', ')

    const sent = await sendWhatsAppMessage({
      phone: appt.customer.phone,
      message: whatsappTemplates.lembreteVigilia({
        clientName: appt.customer.name,
        serviceName: appt.service.name,
        professionalName: appt.professional.businessName,
        time: format(new Date(appt.scheduledAt), 'HH:mm'),
        address: address || undefined,
      }),
      credentials,
    })

    results.push({ appointmentId: appt.id, customerName: appt.customer.name, type: 'J-1', sent })
  }

  return results
}

// ── H-2: Lembrete 2 horas antes (apenas plano PRO) ────────────────────────────

async function sendTwoHourReminders(now: Date): Promise<ReminderResult[]> {
  const windowStart = addHours(now, 1.833)
  const windowEnd = addHours(now, 2.167)

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: windowStart, lte: windowEnd },
      status: { in: ['PENDING', 'CONFIRMED'] },
      reminderTwoHours: false,
      // Only PRO plan professionals get 2-hour reminders
      professional: { plan: 'PRO' },
    },
    include: {
      customer: true,
      service: true,
      professional: {
        select: {
          plan: true,
          businessName: true,
          address: true,
          city: true,
          state: true,
          zapiInstanceId: true,
          whatsappToken: true,
          zapiClientToken: true,
        },
      },
    },
  })

  const results: ReminderResult[] = []

  for (const appt of appointments) {
    const credentials = getCredentials(appt.professional)

    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminderTwoHours: true },
    })

    if (!credentials) {
      results.push({ appointmentId: appt.id, customerName: appt.customer.name, type: 'H-2', sent: false, skipped: 'sem credenciais Z-API' })
      continue
    }

    const address = [appt.professional.address, appt.professional.city, appt.professional.state]
      .filter(Boolean).join(', ')

    const sent = await sendWhatsAppMessage({
      phone: appt.customer.phone,
      message: whatsappTemplates.lembreteDuasHoras({
        clientName: appt.customer.name,
        serviceName: appt.service.name,
        professionalName: appt.professional.businessName,
        time: format(new Date(appt.scheduledAt), 'HH:mm'),
        address: address || undefined,
      }),
      credentials,
    })

    results.push({ appointmentId: appt.id, customerName: appt.customer.name, type: 'H-2', sent })
  }

  return results
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const now = new Date()
  console.log(`[Cron] Executando lembretes PRO em ${format(now, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}`)

  try {
    const [j1Results, h2Results] = await Promise.all([
      sendDayBeforeReminders(now),
      sendTwoHourReminders(now),
    ])

    const summary = {
      executedAt: now.toISOString(),
      j1: { total: j1Results.length, sent: j1Results.filter((r) => r.sent).length, details: j1Results },
      h2: { total: h2Results.length, sent: h2Results.filter((r) => r.sent).length, details: h2Results },
    }

    console.log(`[Cron] Concluído: J-1=${summary.j1.sent}/${summary.j1.total}, H-2=${summary.h2.sent}/${summary.h2.total}`)
    return NextResponse.json(summary)
  } catch (err) {
    console.error('[Cron] Erro:', err)
    return NextResponse.json({ error: 'Erro interno', details: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
