export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getSession()
  return session?.role === 'admin' ? session : null
}

export async function PUT(req: NextRequest, { params }: { params: { unit: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const unit = await prisma.productionUnit.findUnique({ where: { id: params.unit } })
  if (!unit) return NextResponse.json({ error: 'Unité introuvable' }, { status: 404 })

  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (body.name) data.name = body.name
  if (typeof body.allowOrderModification === 'boolean') data.allowOrderModification = body.allowOrderModification
  if (body.password) {
    if (body.password.length < 4) return NextResponse.json({ error: 'Mot de passe trop court' }, { status: 422 })
    data.password = await bcrypt.hash(body.password, 10)
  }

  const updated = await prisma.productionUnit.update({ where: { id: params.unit }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: { unit: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const unit = await prisma.productionUnit.findUnique({ where: { id: params.unit } })
  if (!unit) return NextResponse.json({ error: 'Unité introuvable' }, { status: 404 })

  await prisma.productionUnit.delete({ where: { id: params.unit } })
  return NextResponse.json({ ok: true })
}
