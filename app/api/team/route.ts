import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  name:  z.string().min(1, 'Nome é obrigatório'),
  role:  z.string().min(1, 'Função é obrigatória'),
  image: z.string().url().optional().or(z.literal('')),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const members = await prisma.teamMember.findMany({
    where: { professionalId: session.user.id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(members)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.errors }, { status: 422 })

  const member = await prisma.teamMember.create({
    data: {
      name:  parsed.data.name,
      role:  parsed.data.role,
      image: parsed.data.image || null,
      professionalId: session.user.id,
    },
  })
  return NextResponse.json(member, { status: 201 })
}
