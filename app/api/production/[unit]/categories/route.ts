import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const TYPE_MAP: Record<string, 'CUISINE' | 'BOULANGERIE' | 'PIZZERIA'> = {
  cuisine: 'CUISINE', boulangerie: 'BOULANGERIE', pizzeria: 'PIZZERIA',
}

export async function GET(_req: NextRequest, { params }: { params: { unit: string } }) {
  const session = await getSession()
  const unit = params.unit.toLowerCase()
  if (!session || session.role !== unit) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const unitType = TYPE_MAP[unit]
  if (!unitType) return NextResponse.json([], { status: 200 })
  const categories = await prisma.category.findMany({ where: { unitType }, orderBy: { name: 'asc' } })
  return NextResponse.json(categories)
}
