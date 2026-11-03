import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const categories = await prisma.category.findMany({ orderBy: [{ unitType: 'asc' }, { name: 'asc' }] })
  return NextResponse.json(categories)
}
