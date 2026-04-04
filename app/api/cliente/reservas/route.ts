import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/auth-customer'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('cliente_token')?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const customer = verifyCustomerToken(token)
  if (!customer) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  // Find all appointments where customer email matches
  const customerRecords = await prisma.customer.findMany({
    where: { email: customer.email },
    select: { id: true },
  })
  const customerIds = customerRecords.map(c => c.id)

  const appointments = await prisma.appointment.findMany({
    where: {
      customerId: { in: customerIds },
      status: { not: 'CANCELLED' },
    },
    include: {
      service: { select: { name: true, duration: true, price: true } },
      professional: { select: { businessName: true, city: true, state: true, address: true, phone: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  })

  return NextResponse.json(appointments)
}
