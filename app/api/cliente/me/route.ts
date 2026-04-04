import { NextRequest, NextResponse } from 'next/server'
import { verifyCustomerToken } from '@/lib/auth-customer'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('cliente_token')?.value
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const customer = verifyCustomerToken(token)
  if (!customer) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  return NextResponse.json(customer)
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('cliente_token')
  return res
}
