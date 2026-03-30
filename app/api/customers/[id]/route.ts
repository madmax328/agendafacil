import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
})

export async function PUT(
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

  let data: z.infer<typeof updateCustomerSchema>
  try {
    data = updateCustomerSchema.parse(body)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
  }

  try {
    const updated = await prisma.customer.update({
      where: { id: params.id, professionalId: session.user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone.replace(/\D/g, '') }),
        email: data.email === '' ? null : data.email,
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: { _count: { select: { appointments: true } } },
    })
    return NextResponse.json({ ...updated, lastAppointment: null })
  } catch {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
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
    await prisma.customer.delete({
      where: { id: params.id, professionalId: session.user.id },
    })
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }
}
