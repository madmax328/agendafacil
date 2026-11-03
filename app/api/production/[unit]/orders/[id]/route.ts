export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: { unit: string; id: string } }) {
  const session = await getSession()
  const unit = params.unit.toLowerCase()
  if (!session || session.role !== unit) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { status } = await req.json()
  if (status !== 'CONFIRMED') return NextResponse.json({ error: 'Seule la confirmation est autorisée' }, { status: 422 })

  const order = await prisma.order.findUnique({ where: { id: params.id } })
  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  if (order.status !== 'PENDING') return NextResponse.json({ error: 'Commande déjà traitée' }, { status: 409 })

  const updated = await prisma.order.update({ where: { id: params.id }, data: { status: 'CONFIRMED' } })
  return NextResponse.json(updated)
}
