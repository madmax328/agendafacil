import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAdminToken, adminCookieOptions } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  // Only allowed when zero admin users exist
  const count = await (prisma as any).adminUser.count()
  if (count > 0) {
    return NextResponse.json({ error: 'Setup já concluído' }, { status: 403 })
  }

  const { email, password } = await req.json()
  if (!email?.trim() || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Email obrigatório e password com mínimo 8 caracteres' },
      { status: 400 }
    )
  }

  const hashed = await bcrypt.hash(password, 12)
  const admin = await (prisma as any).adminUser.create({
    data: { email: email.toLowerCase().trim(), password: hashed },
  })

  const token = await signAdminToken({ adminId: admin.id, email: admin.email })
  const res = NextResponse.json({ ok: true })
  res.cookies.set(adminCookieOptions(token))
  return res
}
