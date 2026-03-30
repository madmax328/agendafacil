import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createAppointmentSchema = z.object({
  customerId: z.string(),
  serviceId: z.string(),
  scheduledAt: z.string(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId: session.user.id,
      ...(start && end
        ? {
            scheduledAt: {
              gte: new Date(start),
              lte: new Date(end),
            },
          }
        : {}),
    },
    include: {
      customer: true,
      service: true,
    },
    orderBy: { scheduledAt: 'asc' },
  })

  return NextResponse.json(appointments)
}

export async function POST(req: NextRequest) {
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

  let data: z.infer<typeof createAppointmentSchema>
  try {
    data = createAppointmentSchema.parse(body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
  }

  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
  })

  if (!service) {
    return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
  }

  // Verify customer belongs to this professional
  const customer = await prisma.customer.findFirst({
    where: { id: data.customerId, professionalId: session.user.id },
  })
  if (!customer) {
    return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
  }

  const scheduledAt = new Date(data.scheduledAt)
  const endsAt = new Date(scheduledAt.getTime() + service.duration * 60_000)

  // Check for overlapping appointments
  const conflict = await prisma.appointment.findFirst({
    where: {
      professionalId: session.user.id,
      status: { not: 'CANCELLED' },
      OR: [
        { scheduledAt: { gte: scheduledAt, lt: endsAt } },
        { endsAt: { gt: scheduledAt, lte: endsAt } },
        { scheduledAt: { lte: scheduledAt }, endsAt: { gte: endsAt } },
      ],
    },
  })

  if (conflict) {
    return NextResponse.json(
      { error: 'Conflito de horário com outro agendamento' },
      { status: 409 },
    )
  }

  const appointment = await prisma.appointment.create({
    data: {
      professionalId: session.user.id,
      customerId: data.customerId,
      serviceId: data.serviceId,
      scheduledAt,
      endsAt,
      notes: data.notes,
    },
    include: {
      customer: true,
      service: true,
    },
  })

  return NextResponse.json(appointment, { status: 201 })
}
