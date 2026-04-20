import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { status } = await req.json()
  if (!['open', 'answered', 'closed'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  await (prisma as any).supportMessage.update({
    where: { id: params.id },
    data: { status },
  })

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  // Mark as read by admin when opened
  await (prisma as any).supportMessage.update({
    where: { id: params.id },
    data: { readByAdmin: true },
  })

  return NextResponse.json({ ok: true })
}
