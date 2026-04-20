import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendSupportAdminNotif } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { replyText } = await req.json()
  if (!replyText?.trim()) {
    return NextResponse.json({ error: 'Resposta não pode estar vazia' }, { status: 400 })
  }

  const ticket = await (prisma as any).supportMessage.findUnique({ where: { id: params.id } })
  if (!ticket) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })
  if (ticket.professionalId !== session.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }
  if (ticket.status === 'closed') {
    return NextResponse.json({ error: 'Ticket encerrado' }, { status: 400 })
  }

  const reply = await (prisma as any).supportReply.create({
    data: { messageId: params.id, replyText: replyText.trim(), authorType: 'PROFESSIONAL' },
  })

  // Reset ticket so admin sees it as needing attention
  await (prisma as any).supportMessage.update({
    where: { id: params.id },
    data: { status: 'open', readByAdmin: false },
  })

  // Notify admin
  sendSupportAdminNotif({
    professionalName: ticket.professionalName,
    professionalEmail: ticket.professionalEmail,
    subject: ticket.subject,
    replyText: replyText.trim(),
  }).catch(err => console.error('[Email] sendSupportAdminNotif:', err))

  return NextResponse.json({ ok: true, reply })
}
