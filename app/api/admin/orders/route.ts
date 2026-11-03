export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfDay, endOfDay } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')

  const where = date ? {
    deliveryDate: { gte: startOfDay(new Date(date)), lte: endOfDay(new Date(date)) },
  } : {}

  const orders = await prisma.order.findMany({
    where,
    orderBy: { deliveryDate: 'asc' },
    include: {
      cafeteria: { select: { name: true } },
      items: { include: { product: { select: { name: true, unit: true, unitType: true } } } },
    },
  })
  return NextResponse.json(orders)
}
