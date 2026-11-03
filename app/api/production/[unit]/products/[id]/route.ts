import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const TYPE_MAP: Record<string, 'CUISINE' | 'BOULANGERIE' | 'PIZZERIA'> = {
  cuisine: 'CUISINE', boulangerie: 'BOULANGERIE', pizzeria: 'PIZZERIA',
}

async function requireUnit(unit: string) {
  const session = await getSession()
  if (!session || session.role !== unit.toLowerCase()) return null
  return TYPE_MAP[unit.toLowerCase()] ?? null
}

export async function PUT(req: NextRequest, { params }: { params: { unit: string; id: string } }) {
  const unitType = await requireUnit(params.unit)
  if (!unitType) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { name, unit, active, categoryId, newCategory } = await req.json()
  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (unit !== undefined) data.unit = unit
  if (active !== undefined) data.active = active

  if (newCategory) {
    const cat = await prisma.category.create({ data: { name: newCategory, unitType } })
    data.categoryId = cat.id
  } else if (categoryId !== undefined) {
    data.categoryId = categoryId || null
  }

  const product = await prisma.product.update({ where: { id: params.id }, data, include: { category: true } })
  return NextResponse.json(product)
}

export async function DELETE(_req: NextRequest, { params }: { params: { unit: string; id: string } }) {
  const unitType = await requireUnit(params.unit)
  if (!unitType) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  await prisma.product.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
