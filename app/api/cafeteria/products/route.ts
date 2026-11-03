import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'cafeteria') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    include: { category: { select: { id: true, name: true } } },
  })

  const grouped = {
    CUISINE: products.filter(p => p.unitType === 'CUISINE'),
    BOULANGERIE: products.filter(p => p.unitType === 'BOULANGERIE'),
    PIZZERIA: products.filter(p => p.unitType === 'PIZZERIA'),
  }

  return NextResponse.json(grouped)
}
