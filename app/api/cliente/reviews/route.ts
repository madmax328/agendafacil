import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/auth-customer'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('cliente_token')?.value
    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    const customer = verifyCustomerToken(token)
    if (!customer) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    const { appointmentId, rating, comment } = await req.json()
    if (!appointmentId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const account = await prisma.clientAccount.findUnique({
      where: { id: customer.id },
      select: { phone: true, email: true, name: true },
    })
    if (!account) return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })

    const byPhone = await prisma.customer.findMany({ where: { phone: account.phone }, select: { id: true } })
    const byEmail = account.email
      ? await prisma.customer.findMany({ where: { email: account.email }, select: { id: true } })
      : []
    const customerIds = Array.from(new Set([...byPhone.map(c => c.id), ...byEmail.map(c => c.id)]))

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, customerId: { in: customerIds }, status: 'COMPLETED' },
    })
    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado ou não concluído' }, { status: 404 })
    }

    // Check for duplicate review
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma.review as any).findFirst({ where: { appointmentId } })
    if (existing) return NextResponse.json({ error: 'Você já avaliou este serviço' }, { status: 409 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const review = await (prisma.review as any).create({
      data: {
        rating,
        comment: comment?.trim() || null,
        clientName: account.name,
        professionalId: appointment.professionalId,
        appointmentId,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[reviews] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
