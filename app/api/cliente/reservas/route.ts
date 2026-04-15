import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/auth-customer'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('cliente_token')?.value
    if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    const customer = verifyCustomerToken(token)
    if (!customer) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

    // Load the full ClientAccount to get phone and email
    const account = await prisma.clientAccount.findUnique({
      where: { id: customer.id },
      select: { phone: true, email: true },
    })
    if (!account) return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })

    // Find Customer records that belong to this client (by phone — always required)
    const customerRecords = await prisma.customer.findMany({
      where: { phone: account.phone },
      select: { id: true },
    })

    // Also search by email as fallback
    const byEmail = account.email
      ? await prisma.customer.findMany({
          where: { email: account.email },
          select: { id: true },
        })
      : []

    // Merge IDs, remove duplicates
    const idSet = new Set([
      ...customerRecords.map(c => c.id),
      ...byEmail.map(c => c.id),
    ])
    const customerIds = Array.from(idSet)

    if (customerIds.length === 0) {
      return NextResponse.json([])
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        customerId: { in: customerIds },
        NOT: { status: 'CANCELLED' },
      },
      include: {
        service: { select: { name: true, duration: true, price: true } },
        professional: {
          select: { businessName: true, city: true, state: true, address: true, phone: true },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    })

    return NextResponse.json(appointments)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[reservas] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
