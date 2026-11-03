export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'cafeteria') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cafeteria = await prisma.cafeteria.findUnique({ where: { name: session.name } })
  if (!cafeteria) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  const where: Record<string, unknown> = { cafeteriaId: cafeteria.id }
  if (date) {
    const d = new Date(date)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    where.deliveryDate = { gte: d, lt: next }
  }

  const amendments = await prisma.orderAmendment.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(amendments)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'cafeteria') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cafeteria = await prisma.cafeteria.findUnique({ where: { name: session.name } })
  if (!cafeteria) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { type, deliveryDate, items } = await req.json()

  if (!['ADD', 'CANCEL'].includes(type)) return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  if (!deliveryDate) return NextResponse.json({ error: 'Date requise' }, { status: 400 })
  if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'Aucun produit sélectionné' }, { status: 400 })

  const amendment = await prisma.orderAmendment.create({
    data: {
      type,
      cafeteriaId: cafeteria.id,
      deliveryDate: new Date(deliveryDate),
      items: {
        create: items.map((item: { productId: string; quantity: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: { include: { product: true } } },
  })

  return NextResponse.json(amendment)
}
