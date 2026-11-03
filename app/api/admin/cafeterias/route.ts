export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'admin') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const list = await prisma.cafeteria.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { name, password } = await req.json()
  if (!name || !password) return NextResponse.json({ error: 'Nom et mot de passe requis' }, { status: 422 })

  const existing = await prisma.cafeteria.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } })
  if (existing) return NextResponse.json({ error: 'Ce nom est déjà utilisé' }, { status: 409 })

  const cafeteria = await prisma.cafeteria.create({
    data: { name, password: await bcrypt.hash(password, 10) },
  })
  return NextResponse.json(cafeteria, { status: 201 })
}
