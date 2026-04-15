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

    const account = await prisma.clientAccount.findUnique({
      where: { id: customer.id },
      select: { phone: true, email: true },
    })
    if (!account) return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })

    // Find all Customer records that match this client (by phone and email)
    const byPhone = await prisma.customer.findMany({
      where: { phone: account.phone },
      select: { id: true },
    })
    const byEmail = account.email
      ? await prisma.customer.findMany({
          where: { email: account.email },
          select: { id: true },
        })
      : []

    const customerIds = Array.from(new Set([
      ...byPhone.map(c => c.id),
      ...byEmail.map(c => c.id),
    ]))

    if (customerIds.length === 0) return NextResponse.json([])

    // Fetch appointments WITHOUT relational include to avoid orphaned-ref errors
    const appointments = await prisma.appointment.findMany({
      where: {
        customerId: { in: customerIds },
        NOT: { status: 'CANCELLED' },
      },
      include: {
        service: { select: { name: true, duration: true, price: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    })

    if (appointments.length === 0) return NextResponse.json([])

    // Fetch professionals separately — handle missing refs gracefully
    const professionalIds = [...new Set(appointments.map(a => a.professionalId))]
    const professionals = await prisma.professional.findMany({
      where: { id: { in: professionalIds } },
      select: { id: true, businessName: true, city: true, state: true, address: true, phone: true, slug: true },
    })
    const proMap = new Map(professionals.map(p => [p.id, p]))

    // Join and filter out orphaned appointments (professional deleted)
    const result = appointments
      .filter(a => proMap.has(a.professionalId))
      .map(a => ({
        ...a,
        professional: proMap.get(a.professionalId)!,
      }))

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[reservas] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
