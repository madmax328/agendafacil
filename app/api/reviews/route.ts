import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  rating:     z.number().int().min(1).max(5),
  comment:    z.string().optional(),
  clientName: z.string().min(1, 'Nome do cliente é obrigatório'),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const reviews = await prisma.review.findMany({
    where: { professionalId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.errors }, { status: 422 })

  const review = await prisma.review.create({
    data: {
      rating:     parsed.data.rating,
      comment:    parsed.data.comment || null,
      clientName: parsed.data.clientName,
      professionalId: session.user.id,
    },
  })
  return NextResponse.json(review, { status: 201 })
}
