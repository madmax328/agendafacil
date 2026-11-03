import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
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

  // Also create the 3 production units with default password
  for (const [type, name] of [['CUISINE', 'Cuisine'], ['BOULANGERIE', 'Boulangerie'], ['PIZZERIA', 'Pizzeria']] as const) {
    await prisma.productionUnit.upsert({
      where: { type },
      update: {},
      create: { type, name, password: await bcrypt.hash('1234', 10) },
    })
  }

  return NextResponse.json({ id: admin.id }, { status: 201 })
}
