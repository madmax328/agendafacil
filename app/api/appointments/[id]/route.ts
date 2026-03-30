import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  notes: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  let data: z.infer<typeof patchSchema>
  try {
    data = patchSchema.parse(body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
  }

  try {
    const updated = await prisma.appointment.update({
      where: { id: params.id, professionalId: session.user.id },
      data,
      include: { customer: true, service: true },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    await prisma.appointment.delete({
      where: { id: params.id, professionalId: session.user.id },
    })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
  }
}
