export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { unit: string } }) {
  const session = await getSession()
  const unit = params.unit.toLowerCase()
  if (!session || session.role !== unit) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const unitType = unit.toUpperCase()

  const products = await prisma.product.findMany({
    where: { unitType, active: true },
    orderBy: { name: 'asc' },
    include: { category: { select: { id: true, name: true } } },
  })

  return NextResponse.json(products)
}
