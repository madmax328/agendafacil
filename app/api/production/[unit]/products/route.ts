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

export async function GET(_req: NextRequest, { params }: { params: { unit: string } }) {
  const unitType = await requireUnit(params.unit)
  if (!unitType) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const products = await prisma.product.findMany({
    where: { unitType },
    orderBy: { name: 'asc' },
    include: { category: true },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest, { params }: { params: { unit: string } }) {
  const unitType = await requireUnit(params.unit)
  if (!unitType) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { name, unit, categoryId, newCategory } = await req.json()
  if (!name || !unit) return NextResponse.json({ error: 'Champs requis' }, { status: 422 })

  let finalCategoryId = categoryId || undefined
  if (newCategory) {
    const cat = await prisma.category.create({ data: { name: newCategory, unitType } })
    finalCategoryId = cat.id
  }

  const product = await prisma.product.create({
    data: { name, unit, unitType, categoryId: finalCategoryId },
    include: { category: true },
  })
  return NextResponse.json(product, { status: 201 })
}
