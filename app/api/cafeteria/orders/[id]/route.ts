export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { startOfDay } from '@/lib/utils'

async function requireCafeteria() {
  const session = await getSession()
  if (!session || session.role !== 'cafeteria') return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireCafeteria()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { deliveryDate, items } = await req.json()

  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order || order.cafeteriaId !== session.id) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

  // Delete existing items and recreate
  await prisma.$transaction([
    prisma.orderItem.deleteMany({ where: { orderId: params.id } }),
    prisma.order.update({
      where: { id: params.id },
      data: {
        deliveryDate: deliveryDate ? startOfDay(new Date(deliveryDate)) : undefined,
        items: {
          create: items.map((item: { productId: string; quantity: number; notes?: string }) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes,
          })),
        },
      },
    }),
  ])

  const updated = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  })

  return NextResponse.json(updated)
}
