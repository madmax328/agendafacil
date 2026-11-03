export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { unit: string } }) {
  const session = await getSession()
  if (!session || session.role !== params.unit) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  const unitType = params.unit.toUpperCase()

  const unitProducts = await prisma.product.findMany({
    where: { unitType },
    select: { id: true },
  })
  const productIds = unitProducts.map(p => p.id)

  const dateFilter: Record<string, unknown> = {}
  if (date) {
    const d = new Date(date)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    dateFilter.deliveryDate = { gte: d, lt: next }
  }

  const amendments = await prisma.orderAmendment.findMany({
    where: {
      ...dateFilter,
      items: { some: { productId: { in: productIds } } },
    },
    include: {
      cafeteria: true,
      items: {
        where: { productId: { in: productIds } },
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(amendments)
}
