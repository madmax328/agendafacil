export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken, COOKIE_NAME, COOKIE_MAX_AGE, roleRedirect } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json()
  if (!identifier || !password) {
    return NextResponse.json({ error: 'Identifiant et mot de passe requis' }, { status: 400 })
  }

  let id = ''
  let role = ''
  let name = ''
  let hash = ''

  // 1. Check admin (by email)
  if (identifier.includes('@')) {
    const admin = await prisma.admin.findUnique({ where: { email: identifier.toLowerCase() } })
    if (admin) {
      id = admin.id; role = 'admin'; name = 'Admin'; hash = admin.password
    }
  }

  // 2. Check production units (dynamic — lookup by type uppercase)
  if (!id) {
    const unit = await prisma.productionUnit.findFirst({ where: { type: identifier.toUpperCase() } })
    if (unit) {
      id = unit.id
      role = unit.type.toLowerCase()
      name = unit.name
      hash = unit.password
    }
  }

  // 3. Check cafeteria (by name)
  if (!id) {
    const cafeteria = await prisma.cafeteria.findFirst({
      where: { name: { equals: identifier, mode: 'insensitive' }, active: true },
    })
    if (cafeteria) {
      id = cafeteria.id; role = 'cafeteria'; name = cafeteria.name; hash = cafeteria.password
    }
  }

  if (!id) return NextResponse.json({ error: 'Identifiant introuvable' }, { status: 401 })

  const valid = await bcrypt.compare(password, hash)
  if (!valid) return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })

  const token = await signToken({ id, role, name })
  const redirect = roleRedirect(role)

  const res = NextResponse.json({ redirect })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}
