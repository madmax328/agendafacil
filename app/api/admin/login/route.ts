import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAdminToken, adminCookieOptions } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: 'Email e password são obrigatórios' }, { status: 400 })
  }

  const admin = await (prisma as any).adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
  }

  const token = await signAdminToken({ adminId: admin.id, email: admin.email })

  const res = NextResponse.json({ ok: true })
  res.cookies.set(adminCookieOptions(token))
  return res
}
