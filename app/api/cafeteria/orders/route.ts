export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfDay, endOfDay } from '@/lib/utils'

async function requireCafeteria() {
  const session = await getSession()
  if (!session || session.role !== 'cafeteria') return null
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireCafeteria()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date')
  if (!dateStr) return NextResponse.json(null)

  const date = new Date(dateStr)
  const order = await prisma.order.findFirst({
    where: {
      cafeteriaId: session.id,
      deliveryDate: { gte: startOfDay(date), lte: endOfDay(date) },
    },
    include: {
      items: {
        include: { product: { select: { name: true, unit: true, unitType: true } } },
      },
    },
  })

  return NextResponse.json(order ?? null)
}

export async function POST(req: NextRequest) {
  const session = await requireCafeteria()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { deliveryDate, items } = await req.json()
  if (!deliveryDate || !items?.length) return NextResponse.json({ error: 'Date et articles requis' }, { status: 422 })

  const date = new Date(deliveryDate)

  // Check no existing order for this date
  const existing = await prisma.order.findFirst({
    where: {
      cafeteriaId: session.id,
      deliveryDate: { gte: startOfDay(date), lte: endOfDay(date) },
    },
  })
  if (existing) return NextResponse.json({ error: 'Une commande existe déjà pour cette date, modifiez-la' }, { status: 409 })

  const order = await prisma.order.create({
    data: {
      cafeteriaId: session.id,
      deliveryDate: startOfDay(date),
      items: {
        create: items.map((item: { productId: string; quantity: number; notes?: string }) => ({
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      },
    },
    include: { items: true },
  })

  return NextResponse.json(order, { status: 201 })
}
