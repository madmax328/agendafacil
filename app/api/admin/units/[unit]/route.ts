export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PUT(req: NextRequest, { params }: { params: { unit: string } }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const typeMap: Record<string, 'CUISINE' | 'BOULANGERIE' | 'PIZZERIA'> = {
    CUISINE: 'CUISINE', BOULANGERIE: 'BOULANGERIE', PIZZERIA: 'PIZZERIA',
  }
  const type = typeMap[params.unit.toUpperCase()]
  if (!type) return NextResponse.json({ error: 'Unité inconnue' }, { status: 404 })

  const { password } = await req.json()
  if (!password || password.length < 4) return NextResponse.json({ error: 'Mot de passe trop court' }, { status: 422 })

  await prisma.productionUnit.update({
    where: { type },
    data: { password: await bcrypt.hash(password, 10) },
  })
  return NextResponse.json({ ok: true })
}
