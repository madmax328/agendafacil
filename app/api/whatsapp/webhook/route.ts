import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

// ── Z-API webhook payload types ────────────────────────────────────────────────

interface ZApiTextMessage {
  phone: string
  isGroup: boolean
  isStatusReply: boolean
  text: {
    message: string
  }
}

interface ZApiMessage {
  phone: string
  isGroup: boolean
  isStatusReply: boolean
  momment: number // Z-API typo (timestamp)
  type: 'ReceivedCallback' | string
  text?: { message: string }
  image?: { caption?: string }
  audio?: unknown
  document?: unknown
  video?: unknown
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  // Remove country code 55 prefix for DB lookup
  if (digits.startsWith('55') && digits.length > 11) {
    return digits.slice(2)
  }
  return digits
}

function extractTextMessage(body: ZApiMessage): string | null {
  if (body.text?.message) return body.text.message.trim()
  return null
}

async function findCustomerAndProfessional(phone: string) {
  const normalized = normalizePhone(phone)

  // Try exact match and also with leading 9 for mobile
  const customer = await prisma.customer.findFirst({
    where: {
      phone: { in: [normalized, `9${normalized}`, normalized.replace(/^9/, '')] },
    },
    include: {
      professional: {
        select: {
          id: true,
          businessName: true,
        },
      },
    },
  })

  return customer
}

async function getNextAppointment(customerId: string) {
  return prisma.appointment.findFirst({
    where: {
      customerId,
      scheduledAt: { gte: new Date() },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
    include: { service: true },
    orderBy: { scheduledAt: 'asc' },
  })
}

function buildHelpMessage(businessName: string): string {
  return `Olá! 👋 Você está falando com o sistema automático de *${businessName}*.

Para verificar seu próximo agendamento, responda *HORARIO*.
Para cancelar um agendamento, responda *CANCELAR*.

Se precisar de ajuda humana, entre em contato diretamente com o estabelecimento. 😊`
}

// ── Webhook handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Optionally validate a shared secret from Z-API headers
  const zapiToken = req.headers.get('x-api-token') ?? req.headers.get('client-token')
  const expectedToken = process.env.ZAPI_TOKEN
  if (expectedToken && zapiToken !== expectedToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: ZApiMessage
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  // Ignore groups and status replies
  if (body.isGroup || body.isStatusReply) {
    return NextResponse.json({ ok: true })
  }

  // Only process text messages
  const messageText = extractTextMessage(body)
  if (!messageText) {
    return NextResponse.json({ ok: true })
  }

  const phone = body.phone
  const command = messageText.toUpperCase().trim()

  try {
    const customer = await findCustomerAndProfessional(phone)

    if (!customer) {
      // Unknown sender – send generic response
      await sendWhatsAppMessage({
        phone,
        message: 'Olá! Não encontramos seu cadastro em nosso sistema. Para agendar, acesse nosso link de agendamento.',
      })
      return NextResponse.json({ ok: true })
    }

    const { professional } = customer

    if (command === 'HORARIO' || command === 'HORÁRIO') {
      const next = await getNextAppointment(customer.id)
      if (!next) {
        await sendWhatsAppMessage({
          phone,
          message: `Olá ${customer.name}! 😊\n\nVocê não possui agendamentos futuros em *${professional.businessName}*.\n\nAcesse nosso link para agendar um novo horário!`,
        })
      } else {
        const { format } = await import('date-fns')
        const { ptBR } = await import('date-fns/locale')
        const date = format(new Date(next.scheduledAt), "dd/MM/yyyy", { locale: ptBR })
        const time = format(new Date(next.scheduledAt), 'HH:mm')

        await sendWhatsAppMessage({
          phone,
          message: `Olá ${customer.name}! 📅\n\nSeu próximo agendamento em *${professional.businessName}*:\n\n📋 Serviço: ${next.service.name}\n📅 Data: ${date}\n🕐 Horário: ${time}\n\nAté lá! 😊`,
        })
      }
    } else if (command === 'CANCELAR') {
      const next = await getNextAppointment(customer.id)
      if (!next) {
        await sendWhatsAppMessage({
          phone,
          message: `Olá ${customer.name}! Não encontramos agendamentos futuros para cancelar. 😊`,
        })
      } else {
        await prisma.appointment.update({
          where: { id: next.id },
          data: { status: 'CANCELLED' },
        })

        const { format } = await import('date-fns')
        const date = format(new Date(next.scheduledAt), 'dd/MM/yyyy')
        const time = format(new Date(next.scheduledAt), 'HH:mm')

        await sendWhatsAppMessage({
          phone,
          message: `Olá ${customer.name}! ✅\n\nSeu agendamento de *${next.service.name}* em ${date} às ${time} foi *cancelado*.\n\nSe quiser reagendar, acesse nosso link. Até mais! 😊`,
        })
      }
    } else {
      // Unknown command – send help
      await sendWhatsAppMessage({
        phone,
        message: buildHelpMessage(professional.businessName),
      })
    }
  } catch (err) {
    console.error('[WhatsApp Webhook] Erro ao processar mensagem:', err)
    // Don't expose internal errors to Z-API; always return 200
  }

  return NextResponse.json({ ok: true })
}

// Z-API also sends GET to verify the webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'webhook ativo' })
}
