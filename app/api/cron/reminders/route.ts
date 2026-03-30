import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage, whatsappTemplates } from '@/lib/whatsapp'
import { addHours, addDays, startOfDay, endOfDay, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── Auth helper ────────────────────────────────────────────────────────────────

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    // Warn in production if secret is not set
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Cron] CRON_SECRET não está configurado!')
      return false
    }
    return true // Allow in development
  }

  return token === cronSecret
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface ReminderResult {
  appointmentId: string
  customerName: string
  phone: string
  type: 'J-1' | 'H-2'
  sent: boolean
}

// ── Reminder helpers ───────────────────────────────────────────────────────────

async function sendDayBeforeReminders(now: Date): Promise<ReminderResult[]> {
  const tomorrowStart = startOfDay(addDays(now, 1))
  const tomorrowEnd = endOfDay(addDays(now, 1))

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: tomorrowStart, lte: tomorrowEnd },
      status: { in: ['PENDING', 'CONFIRMED'] },
      reminderDayBefore: false,
    },
    include: {
      customer: true,
      service: true,
      professional: {
        select: {
          businessName: true,
          address: true,
          city: true,
          state: true,
        },
      },
    },
  })

  const results: ReminderResult[] = []

  for (const appt of appointments) {
    const address = [appt.professional.address, appt.professional.city, appt.professional.state]
      .filter(Boolean)
      .join(', ')

    const sent = await sendWhatsAppMessage({
      phone: appt.customer.phone,
      message: whatsappTemplates.lembreteVigilia({
        clientName: appt.customer.name,
        serviceName: appt.service.name,
        professionalName: appt.professional.businessName,
        time: format(new Date(appt.scheduledAt), 'HH:mm'),
        address: address || undefined,
      }),
    })

    // Mark reminder as sent regardless of delivery (avoid duplicate sends)
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminderDayBefore: true },
    })

    results.push({
      appointmentId: appt.id,
      customerName: appt.customer.name,
      phone: appt.customer.phone,
      type: 'J-1',
      sent,
    })
  }

  return results
}

async function sendTwoHourReminders(now: Date): Promise<ReminderResult[]> {
  // Target window: appointments starting in 1h50m – 2h10m from now
  const windowStart = addHours(now, 1.833) // ~1h50m
  const windowEnd = addHours(now, 2.167)   // ~2h10m

  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: windowStart, lte: windowEnd },
      status: { in: ['PENDING', 'CONFIRMED'] },
      reminderTwoHours: false,
    },
    include: {
      customer: true,
      service: true,
      professional: {
        select: {
          businessName: true,
          address: true,
          city: true,
          state: true,
        },
      },
    },
  })

  const results: ReminderResult[] = []

  for (const appt of appointments) {
    const address = [appt.professional.address, appt.professional.city, appt.professional.state]
      .filter(Boolean)
      .join(', ')

    const sent = await sendWhatsAppMessage({
      phone: appt.customer.phone,
      message: whatsappTemplates.lembreteDuasHoras({
        clientName: appt.customer.name,
        serviceName: appt.service.name,
        professionalName: appt.professional.businessName,
        time: format(new Date(appt.scheduledAt), 'HH:mm'),
        address: address || undefined,
      }),
    })

    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminderTwoHours: true },
    })

    results.push({
      appointmentId: appt.id,
      customerName: appt.customer.name,
      phone: appt.customer.phone,
      type: 'H-2',
      sent,
    })
  }

  return results
}

// ── Route handler ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const now = new Date()
  console.log(`[Cron] Executando lembretes em ${format(now, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}`)

  try {
    const [j1Results, h2Results] = await Promise.all([
      sendDayBeforeReminders(now),
      sendTwoHourReminders(now),
    ])

    const summary = {
      executedAt: now.toISOString(),
      j1: {
        total: j1Results.length,
        sent: j1Results.filter((r) => r.sent).length,
        failed: j1Results.filter((r) => !r.sent).length,
        details: j1Results,
      },
      h2: {
        total: h2Results.length,
        sent: h2Results.filter((r) => r.sent).length,
        failed: h2Results.filter((r) => !r.sent).length,
        details: h2Results,
      },
    }

    console.log(
      `[Cron] Concluído: J-1=${summary.j1.sent}/${summary.j1.total} enviados, H-2=${summary.h2.sent}/${summary.h2.total} enviados`,
    )

    return NextResponse.json(summary)
  } catch (err) {
    console.error('[Cron] Erro ao processar lembretes:', err)
    return NextResponse.json(
      { error: 'Erro interno ao processar lembretes', details: String(err) },
      { status: 500 },
    )
  }
}

// Support POST for cron services that send POST requests (e.g. Vercel Cron)
export async function POST(req: NextRequest) {
  return GET(req)
}
