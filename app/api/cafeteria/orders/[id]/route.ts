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

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: { select: { unitType: true } } } } },
  })
  if (!order || order.cafeteriaId !== session.id) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  // Check modification locks
  const units = await prisma.productionUnit.findMany()
  const lockedTypes = new Set(units.filter(u => !u.allowOrderModification).map(u => u.type))

  if (lockedTypes.size > 0) {
    const existingQty = new Map(order.items.map(i => [i.productId, i.quantity]))
    const existingUnitType = new Map(order.items.map(i => [i.productId, i.product.unitType]))

    for (const item of items as { productId: string; quantity: number }[]) {
      const unitType = existingUnitType.get(item.productId)
      if (!unitType || !lockedTypes.has(unitType)) continue
      const prev = existingQty.get(item.productId) ?? 0
      if (prev > 0 && item.quantity !== 0 && item.quantity !== prev) {
        return NextResponse.json(
          { error: `Modification non autorisée — l'unité a verrouillé les commandes` },
          { status: 403 }
        )
      }
    }

    // Also check new items from locked units (product not in existing order)
    // New items (previously 0) are allowed
    const existingProductIds = new Set(order.items.map(i => i.productId))
    const newItems = (items as { productId: string; quantity: number }[]).filter(
      i => !existingProductIds.has(i.productId) && i.quantity > 0
    )
    if (newItems.length > 0) {
      const newProductIds = newItems.map(i => i.productId)
      const newProducts = await prisma.product.findMany({
        where: { id: { in: newProductIds } },
        select: { id: true, unitType: true },
      })
      // New items from locked units — still allowed (add new products)
      void newProducts
    }
  }

  await prisma.$transaction([
    prisma.orderItem.deleteMany({ where: { orderId: params.id } }),
    prisma.order.update({
      where: { id: params.id },
      data: {
        deliveryDate: deliveryDate ? startOfDay(new Date(deliveryDate)) : undefined,
        items: {
          create: (items as { productId: string; quantity: number }[]).map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    }),
  ])

  const updated = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } })
  return NextResponse.json(updated)
}
