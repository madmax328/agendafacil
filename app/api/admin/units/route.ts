export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getSession()
  return session?.role === 'admin' ? session : null
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const units = await prisma.productionUnit.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(units)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { name, type, password } = await req.json()
  if (!name || !type || !password) return NextResponse.json({ error: 'Nom, identifiant et mot de passe requis' }, { status: 422 })
  if (password.length < 4) return NextResponse.json({ error: 'Mot de passe trop court (4 car. min.)' }, { status: 422 })

  const slug = type.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
  if (!slug) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 422 })

  const existing = await prisma.productionUnit.findUnique({ where: { type: slug } })
  if (existing) return NextResponse.json({ error: 'Cet identifiant est déjà utilisé' }, { status: 409 })

  const unit = await prisma.productionUnit.create({
    data: { type: slug, name, password: await bcrypt.hash(password, 10) },
  })
  return NextResponse.json(unit, { status: 201 })
}
