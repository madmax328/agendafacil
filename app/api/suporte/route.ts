import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendContactoSuporte } from '@/lib/email'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { subject, message } = await req.json()
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Assunto e mensagem são obrigatórios' }, { status: 400 })
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Mensagem demasiado longa (máx. 2000 caracteres)' }, { status: 400 })
  }

  const professional = await prisma.professional.findUnique({
    where: { id: session.user.id },
    select: { name: true, businessName: true, email: true },
  })
  if (!professional) {
    return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
  }

  const trimmedSubject = subject.trim()
  const trimmedMessage = message.trim()
  const professionalName = professional.businessName || professional.name || ''

  await (prisma as any).supportMessage.create({
    data: {
      professionalId: session.user.id,
      professionalName,
      professionalEmail: professional.email,
      subject: trimmedSubject,
      message: trimmedMessage,
    },
  })

  const ok = await sendContactoSuporte({
    professionalName,
    professionalEmail: professional.email,
    subject: trimmedSubject,
    message: trimmedMessage,
  })

  if (!ok) {
    return NextResponse.json({ error: 'Erro ao enviar mensagem. Tente novamente.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
