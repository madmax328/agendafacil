import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createCustomerToken } from '@/lib/auth-customer'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
  const { email, password } = parsed.data

  const client = await prisma.clientAccount.findUnique({ where: { email: email.toLowerCase() } })
  if (!client) return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })

  const valid = await bcrypt.compare(password, client.password)
  if (!valid) return NextResponse.json({ error: 'E-mail ou senha incorretos' }, { status: 401 })

  const token = createCustomerToken({ id: client.id, email: client.email, name: client.name })
  const res = NextResponse.json({ id: client.id, email: client.email, name: client.name })
  res.cookies.set('cliente_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}
