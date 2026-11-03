export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

async function requireUnit(unit: string) {
  const session = await getSession()
  return session?.role === unit.toLowerCase() ? session : null
}

export async function GET(_req: NextRequest, { params }: { params: { unit: string } }) {
  if (!await requireUnit(params.unit)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const unitType = params.unit.toUpperCase()
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { unitType },
      orderBy: { name: 'asc' },
      include: { category: { select: { id: true, name: true } } },
    }),
    prisma.category.findMany({ where: { unitType }, orderBy: { name: 'asc' } }),
  ])
  return NextResponse.json({ products, categories })
}

export async function POST(req: NextRequest, { params }: { params: { unit: string } }) {
  if (!await requireUnit(params.unit)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const unitType = params.unit.toUpperCase()
  const { name, unit, categoryId, newCategory } = await req.json()
  if (!name || !unit) return NextResponse.json({ error: 'Nom et unité requis' }, { status: 422 })

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
