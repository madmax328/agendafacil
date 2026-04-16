import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  name:  z.string().min(1).optional(),
  role:  z.string().min(1).optional(),
  image: z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })

  const member = await prisma.teamMember.updateMany({
    where: { id: params.id, professionalId: session.user.id },
    data: {
      ...(parsed.data.name  !== undefined ? { name: parsed.data.name }   : {}),
      ...(parsed.data.role  !== undefined ? { role: parsed.data.role }   : {}),
      ...(parsed.data.image !== undefined ? { image: parsed.data.image || null } : {}),
    },
  })
  if (member.count === 0) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const result = await prisma.teamMember.deleteMany({
    where: { id: params.id, professionalId: session.user.id },
  })
  if (result.count === 0) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
