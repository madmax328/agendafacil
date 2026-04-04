import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
  const { name, email, phone, password } = parsed.data

  const existing = await prisma.clientAccount.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const client = await prisma.clientAccount.create({
    data: { name, email: email.toLowerCase(), phone: phone.replace(/\D/g, ''), password: hashed },
    select: { id: true, email: true, name: true },
  })
  return NextResponse.json(client, { status: 201 })
}
