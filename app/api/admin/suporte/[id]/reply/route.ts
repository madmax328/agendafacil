import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { replyText } = await req.json()
  if (!replyText?.trim()) {
    return NextResponse.json({ error: 'Resposta não pode estar vazia' }, { status: 400 })
  }

  const ticket = await (prisma as any).supportMessage.findUnique({ where: { id: params.id } })
  if (!ticket) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })

  const reply = await (prisma as any).supportReply.create({
    data: { messageId: params.id, replyText: replyText.trim() },
  })

  await (prisma as any).supportMessage.update({
    where: { id: params.id },
    data: { status: 'answered', proHasUnread: true },
  })

  return NextResponse.json({ ok: true, reply })
}
