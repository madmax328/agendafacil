import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.errors }, { status: 422 })
  const { name, email, password } = parsed.data

  const existing = await prisma.professional.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const professional = await prisma.professional.create({
    data: { name, email: email.toLowerCase(), password: hashed },
    select: { id: true, email: true, name: true },
  })
  return NextResponse.json(professional, { status: 201 })
}
