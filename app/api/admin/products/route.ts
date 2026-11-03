export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const session = await getSession()
  return session?.role === 'admin' ? session : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const products = await prisma.product.findMany({
    orderBy: [{ unitType: 'asc' }, { name: 'asc' }],
    include: { category: true },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { name, unit, unitType, categoryId, newCategory } = await req.json()
  if (!name || !unit || !unitType) return NextResponse.json({ error: 'Champs requis manquants' }, { status: 422 })

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
