import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/auth-customer'
import { addHours, isBefore } from 'date-fns'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const token = req.cookies.get('cliente_token')?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const customer = verifyCustomerToken(token)
  if (!customer) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  // Find appointment and verify ownership
  const appointment = await prisma.appointment.findUnique({
    where: { id: params.id },
    include: { customer: { select: { email: true } } },
  })

  if (!appointment) return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
  if (appointment.customer.email !== customer.email) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  // Check 24h rule
  const now = new Date()
  const deadline = addHours(new Date(appointment.scheduledAt), -24)
  if (isBefore(deadline, now)) {
    return NextResponse.json({
      error: 'Prazo expirado. Alterações só são permitidas até 24h antes do agendamento. Entre em contato com o profissional.'
    }, { status: 403 })
  }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  const { action } = body as { action: string }

  if (action === 'cancel') {
    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}
