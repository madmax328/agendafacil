export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'cafeteria') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const orders = await prisma.order.findMany({
    where: { cafeteriaId: session.id },
    orderBy: { deliveryDate: 'desc' },
    include: {
      items: {
        include: { product: { select: { name: true, unit: true, unitType: true } } },
      },
    },
  })

  return NextResponse.json(orders)
}
