import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/auth-customer'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('cliente_token')?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const customer = verifyCustomerToken(token)
  if (!customer) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  const include = {
    service: { select: { name: true, duration: true, price: true } },
    professional: { select: { businessName: true, city: true, state: true, address: true, phone: true } },
  } as const

  // Query 1: appointments linked to Customer records that share this email (original logic)
  const customerRecords = await prisma.customer.findMany({
    where: { email: customer.email },
    select: { id: true },
  })
  const customerIds = customerRecords.map(c => c.id)

  const byEmail = customerIds.length > 0
    ? await prisma.appointment.findMany({
        where: { customerId: { in: customerIds }, status: { not: 'CANCELLED' } },
        include,
        orderBy: { scheduledAt: 'desc' },
      })
    : []

  // Query 2: appointments linked directly via clientAccountId (new bookings)
  const byAccount = await prisma.appointment.findMany({
    where: { clientAccountId: customer.id, status: { not: 'CANCELLED' } },
    include,
    orderBy: { scheduledAt: 'desc' },
  })

  // Merge and de-duplicate by appointment id
  const seen = new Set(byEmail.map(a => a.id))
  const merged = [
    ...byEmail,
    ...byAccount.filter(a => !seen.has(a.id)),
  ].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  return NextResponse.json(merged)
}
