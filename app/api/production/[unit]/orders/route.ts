export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfDay, endOfDay } from '@/lib/utils'

const TYPE_MAP: Record<string, 'CUISINE' | 'BOULANGERIE' | 'PIZZERIA'> = {
  cuisine: 'CUISINE',
  boulangerie: 'BOULANGERIE',
  pizzeria: 'PIZZERIA',
}

export async function GET(req: NextRequest, { params }: { params: { unit: string } }) {
  const session = await getSession()
  const unit = params.unit.toLowerCase()
  if (!session || session.role !== unit) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const unitType = TYPE_MAP[unit]
  if (!unitType) return NextResponse.json({ error: 'Unité invalide' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date')
  if (!dateStr) return NextResponse.json({ error: 'Date requise' }, { status: 422 })

  const date = new Date(dateStr)
  const orders = await prisma.order.findMany({
    where: {
      deliveryDate: { gte: startOfDay(date), lte: endOfDay(date) },
      items: { some: { product: { unitType, active: true } } },
    },
    include: {
      cafeteria: { select: { name: true } },
      items: {
        where: { product: { unitType } },
        include: { product: { select: { name: true, unit: true } } },
      },
    },
    orderBy: { cafeteria: { name: 'asc' } },
  })

  const result = orders
    .filter(o => o.items.length > 0)
    .map(o => ({
      cafeteriaName: o.cafeteria.name,
      items: o.items,
    }))

  return NextResponse.json(result)
}
