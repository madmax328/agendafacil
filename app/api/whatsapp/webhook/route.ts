import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  // Strip whatsapp: prefix if present
  const raw = phone.replace(/^whatsapp:\+?/, '')
  const digits = raw.replace(/\D/g, '')
  // Remove Brazil country code (55) prefix to match DB storage format
  if (digits.startsWith('55') && digits.length > 11) return digits.slice(2)
  return digits
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

function buildHelpMessage(businessName: string): string {
  return `Olá! 👋 Você está falando com o sistema automático de *${businessName}*.

Para verificar seu próximo agendamento, responda *HORARIO*.
Para cancelar um agendamento, responda *CANCELAR*.

Se precisar de ajuda humana, entre em contato diretamente com o estabelecimento. 😊`
}

// ── Webhook handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Twilio sends form-encoded data
  let formData: URLSearchParams
  try {
    const text = await req.text()
    formData = new URLSearchParams(text)
  } catch {
    return new NextResponse('ok', { status: 200 })
  }

  const from = formData.get('From') ?? ''
  const messageText = (formData.get('Body') ?? '').trim()

  if (!from || !messageText) {
    return new NextResponse('ok', { status: 200 })
  }

  const command = messageText.toUpperCase()

  try {
    const customer = await findCustomerAndProfessional(from)

    if (!customer) {
      return new NextResponse('ok', { status: 200 })
    }

    const { professional } = customer
    // Extract phone digits for reply (Twilio formatPhone in lib/whatsapp handles country code)
    const replyPhone = normalizePhone(from)

    if (command === 'HORARIO' || command === 'HORÁRIO') {
      const next = await getNextAppointment(customer.id)
      if (!next) {
        await sendWhatsAppMessage({
          phone: replyPhone,
          message: `Olá ${customer.name}! 😊\n\nVocê não possui agendamentos futuros em *${professional.businessName}*.\n\nAcesse nosso link para agendar um novo horário!`,
        })
      } else {
        const { format } = await import('date-fns')
        const { ptBR } = await import('date-fns/locale')
        const date = format(new Date(next.scheduledAt), 'dd/MM/yyyy', { locale: ptBR })
        const time = format(new Date(next.scheduledAt), 'HH:mm')
        await sendWhatsAppMessage({
          phone: replyPhone,
          message: `Olá ${customer.name}! 📅\n\nSeu próximo agendamento em *${professional.businessName}*:\n\n📋 Serviço: ${next.service.name}\n📅 Data: ${date}\n🕐 Horário: ${time}\n\nAté lá! 😊`,
        })
      }
    } else if (command === 'CANCELAR') {
      const next = await getNextAppointment(customer.id)
      if (!next) {
        await sendWhatsAppMessage({
          phone: replyPhone,
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
          phone: replyPhone,
          message: `Olá ${customer.name}! ✅\n\nSeu agendamento de *${next.service.name}* em ${date} às ${time} foi *cancelado*.\n\nSe quiser reagendar, acesse nosso link. Até mais! 😊`,
        })
      }
    } else {
      await sendWhatsAppMessage({
        phone: replyPhone,
        message: buildHelpMessage(professional.businessName ?? ''),
      })
    }
  } catch (err) {
    console.error('[WhatsApp Webhook] Erro:', err)
  }

  return new NextResponse('ok', { status: 200 })
}

// Twilio may send GET to verify the webhook endpoint
export async function GET() {
  return NextResponse.json({ status: 'webhook ativo' })
}
