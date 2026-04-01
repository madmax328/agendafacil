import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage, type WhatsAppCredentials } from '@/lib/whatsapp'

// ── Z-API webhook payload types ────────────────────────────────────────────────

interface ZApiMessage {
  phone: string
  isGroup: boolean
  isStatusReply: boolean
  momment: number
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
  if (digits.startsWith('55') && digits.length > 11) return digits.slice(2)
  return digits
}

function extractTextMessage(body: ZApiMessage): string | null {
  if (body.text?.message) return body.text.message.trim()
  return null
}

async function findCustomerAndProfessional(phone: string) {
  const normalized = normalizePhone(phone)
  return prisma.customer.findFirst({
    where: {
      phone: { in: [normalized, `9${normalized}`, normalized.replace(/^9/, '')] },
    },
    include: {
      professional: {
        select: {
          id: true,
          businessName: true,
          zapiInstanceId: true,
          whatsappToken: true,
          zapiClientToken: true,
        },
      },
    },
  })
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

function buildHelpMessage(businessName: string): string {
  return `Olá! 👋 Você está falando com o sistema automático de *${businessName}*.

Para verificar seu próximo agendamento, responda *HORARIO*.
Para cancelar um agendamento, responda *CANCELAR*.

Se precisar de ajuda humana, entre em contato diretamente com o estabelecimento. 😊`
}

// ── Webhook handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: ZApiMessage
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  if (body.isGroup || body.isStatusReply) return NextResponse.json({ ok: true })

  const messageText = extractTextMessage(body)
  if (!messageText) return NextResponse.json({ ok: true })

  const phone = body.phone
  const command = messageText.toUpperCase().trim()

  try {
    const customer = await findCustomerAndProfessional(phone)

    if (!customer) {
      // Can't determine which professional's Z-API to reply through — skip
      return NextResponse.json({ ok: true })
    }

    const { professional } = customer
    const credentials = getCredentials(professional)

    // No credentials configured — can't reply
    if (!credentials) return NextResponse.json({ ok: true })

    if (command === 'HORARIO' || command === 'HORÁRIO') {
      const next = await getNextAppointment(customer.id)
      if (!next) {
        await sendWhatsAppMessage({
          phone,
          credentials,
          message: `Olá ${customer.name}! 😊\n\nVocê não possui agendamentos futuros em *${professional.businessName}*.\n\nAcesse nosso link para agendar um novo horário!`,
        })
      } else {
        const { format } = await import('date-fns')
        const { ptBR } = await import('date-fns/locale')
        const date = format(new Date(next.scheduledAt), 'dd/MM/yyyy', { locale: ptBR })
        const time = format(new Date(next.scheduledAt), 'HH:mm')
        await sendWhatsAppMessage({
          phone,
          credentials,
          message: `Olá ${customer.name}! 📅\n\nSeu próximo agendamento em *${professional.businessName}*:\n\n📋 Serviço: ${next.service.name}\n📅 Data: ${date}\n🕐 Horário: ${time}\n\nAté lá! 😊`,
        })
      }
    } else if (command === 'CANCELAR') {
      const next = await getNextAppointment(customer.id)
      if (!next) {
        await sendWhatsAppMessage({
          phone,
          credentials,
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
          credentials,
          message: `Olá ${customer.name}! ✅\n\nSeu agendamento de *${next.service.name}* em ${date} às ${time} foi *cancelado*.\n\nSe quiser reagendar, acesse nosso link. Até mais! 😊`,
        })
      }
    } else {
      await sendWhatsAppMessage({
        phone,
        credentials,
        message: buildHelpMessage(professional.businessName ?? ''),
      })
    }
  } catch (err) {
    console.error('[WhatsApp Webhook] Erro:', err)
  }

  return NextResponse.json({ ok: true })
}

// Z-API sends GET to verify the webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'webhook ativo' })
}
