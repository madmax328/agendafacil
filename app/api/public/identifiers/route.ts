export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [units, cafeterias] = await Promise.all([
    prisma.productionUnit.findMany({ orderBy: { name: 'asc' }, select: { type: true, name: true } }),
    prisma.cafeteria.findMany({ where: { active: true }, orderBy: { name: 'asc' }, select: { name: true } }),
  ])

  return NextResponse.json({
    units: units.map(u => ({ value: u.type.toLowerCase(), label: u.name })),
    cafeterias: cafeterias.map(c => c.name),
  })
}
