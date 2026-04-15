import { NextRequest, NextResponse } from 'next/server'
import { verifyCustomerToken } from '@/lib/auth-customer'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('cliente_token')?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const customer = verifyCustomerToken(token)
  if (!customer) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  const account = await prisma.clientAccount.findUnique({
    where: { id: customer.id },
    select: { id: true, name: true, email: true, phone: true },
  })
  if (!account) return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })

  return NextResponse.json(account)
}

export async function DELETE(_req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('cliente_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    domain: process.env.NODE_ENV === 'production' ? '.markou.app' : undefined,
    maxAge: 0,
  })
  return res
}
