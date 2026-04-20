import { NextResponse } from 'next/server'
import { adminCookieClear } from '@/lib/admin-auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(adminCookieClear())
  return res
}
