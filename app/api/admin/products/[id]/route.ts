export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const session = await getSession()
  return session?.role === 'admin' ? session : null
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { name, unit, active, categoryId, newCategory } = await req.json()
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (unit !== undefined) data.unit = unit
  if (active !== undefined) data.active = active

  if (newCategory) {
    const current = await prisma.product.findUnique({ where: { id: params.id } })
    if (current) {
      const cat = await prisma.category.create({ data: { name: newCategory, unitType: current.unitType } })
      data.categoryId = cat.id
    }
  } else if (categoryId !== undefined) {
    data.categoryId = categoryId || null
  }

  const product = await prisma.product.update({ where: { id: params.id }, data, include: { category: true } })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
