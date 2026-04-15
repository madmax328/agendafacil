import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/auth-customer'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('cliente_token')?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const customer = verifyCustomerToken(token)
  if (!customer) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  // Load the ClientAccount to get phone + email (phone is the reliable key)
  const account = await prisma.clientAccount.findUnique({
    where: { id: customer.id },
    select: { phone: true, email: true },
  })
  if (!account) return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })

  const include = {
    service: { select: { name: true, duration: true, price: true } },
    professional: { select: { businessName: true, city: true, state: true, address: true, phone: true } },
  } as const

  // Three parallel lookups — merge and de-duplicate in JS to avoid MongoDB OR issues
  const [byPhone, byEmail, byAccountId] = await Promise.all([
    // Primary: Customer records with the same phone number
    prisma.customer.findMany({ where: { phone: account.phone }, select: { id: true } }),
    // Fallback: Customer records with the same email
    account.email
      ? prisma.customer.findMany({ where: { email: account.email }, select: { id: true } })
      : Promise.resolve([]),
    // New bookings: appointments linked directly via clientAccountId
    prisma.appointment.findMany({
      where: { clientAccountId: customer.id, status: { not: 'CANCELLED' } },
      include,
      orderBy: { scheduledAt: 'desc' },
    }),
  ])

  const customerIds = [...new Set([...byPhone.map(c => c.id), ...byEmail.map(c => c.id)])]

  const byCustomer = customerIds.length > 0
    ? await prisma.appointment.findMany({
        where: { customerId: { in: customerIds }, status: { not: 'CANCELLED' } },
        include,
        orderBy: { scheduledAt: 'desc' },
      })
    : []

  // Merge, de-duplicate, sort
  const seen = new Set(byCustomer.map(a => a.id))
  const merged = [
    ...byCustomer,
    ...byAccountId.filter(a => !seen.has(a.id)),
  ].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  return NextResponse.json(merged)
}
