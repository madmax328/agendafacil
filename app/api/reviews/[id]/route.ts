import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  rating:     z.number().int().min(1).max(5).optional(),
  comment:    z.string().optional(),
  clientName: z.string().min(1).optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })

  const result = await prisma.review.updateMany({
    where: { id: params.id, professionalId: session.user.id },
    data: {
      ...(parsed.data.rating     !== undefined ? { rating: parsed.data.rating }         : {}),
      ...(parsed.data.clientName !== undefined ? { clientName: parsed.data.clientName } : {}),
      ...(parsed.data.comment    !== undefined ? { comment: parsed.data.comment || null } : {}),
    },
  })
  if (result.count === 0) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const result = await prisma.review.deleteMany({
    where: { id: params.id, professionalId: session.user.id },
  })
  if (result.count === 0) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
