export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const adminCount = await prisma.admin.count()
    if (adminCount > 0) {
      return NextResponse.json({ error: 'Un compte admin existe déjà' }, { status: 409 })
    }

    const { email, password } = await req.json()
    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Email et mot de passe (6 car. min.) requis' }, { status: 422 })
    }

    const admin = await prisma.admin.create({
      data: { email: email.toLowerCase(), password: await bcrypt.hash(password, 10) },
    })

    for (const [type, name] of [
      ['CUISINE', 'Cuisine'],
      ['BOULANGERIE', 'Boulangerie'],
      ['PIZZERIA', 'Pizzeria'],
    ] as ['CUISINE' | 'BOULANGERIE' | 'PIZZERIA', string][]) {
      await prisma.productionUnit.upsert({
        where: { type },
        update: {},
        create: { type, name, password: await bcrypt.hash('1234', 10) },
      })
    }

    return NextResponse.json({ id: admin.id }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[setup]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
