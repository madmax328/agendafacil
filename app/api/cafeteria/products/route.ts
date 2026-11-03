export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'cafeteria') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [units, products] = await Promise.all([
    prisma.productionUnit.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      include: { category: { select: { id: true, name: true } } },
    }),
  ])

  const grouped: Record<string, typeof products> = {}
  for (const unit of units) {
    grouped[unit.type] = products.filter(p => p.unitType === unit.type)
  }

  return NextResponse.json({
    units: units.map(u => ({ type: u.type, name: u.name, allowOrderModification: u.allowOrderModification })),
    products: grouped,
  })
}
