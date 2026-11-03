export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cafeterias = await prisma.cafeteria.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { name: true },
  })

  return NextResponse.json({
    units: ['Cuisine', 'Boulangerie', 'Pizzeria'],
    cafeterias: cafeterias.map(c => c.name),
  })
}
