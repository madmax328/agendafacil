import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { addMinutes, format, parseISO, setHours, setMinutes, eachMinuteOfInterval } from 'date-fns'
import { sendConfirmacaoEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// ── GET: public info + available time slots ────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const professional = await prisma.professional.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      businessName: true,
      businessType: true,
      address: true,
      city: true,
      state: true,
      services: {
        where: { active: true },
        select: { id: true, name: true, duration: true, price: true, description: true },
        orderBy: { name: 'asc' },
      },
      availability: true,
    },
  })

  if (!professional) {
    return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get('date')
  const serviceId = searchParams.get('serviceId')

  // Base response (no date requested)
  if (!dateParam || !serviceId) {
    return NextResponse.json(
      {
        professional: {
          name: professional.name,
          businessName: professional.businessName,
          businessType: professional.businessType,
          address: professional.address,
          city: professional.city,
          state: professional.state,
        },
        services: professional.services,
      },
      { headers: { 'Cache-Control': 'no-store, must-revalidate' } },
    )
  }

  // Return time slots for a specific date + service
  const service = professional.services.find((s) => s.id === serviceId)
  if (!service) {
    return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
  }

  const requestedDate = parseISO(dateParam)
  const dayOfWeek = requestedDate.getDay()

  const availability = professional.availability.find(
    (a) => a.dayOfWeek === dayOfWeek && a.active,
  )

  if (!availability) {
    return NextResponse.json({ slots: [] })
  }

  // Build candidate slots from availability window
  const [startH, startM] = availability.startTime.split(':').map(Number)
  const [endH, endM] = availability.endTime.split(':').map(Number)

  const windowStart = setMinutes(setHours(requestedDate, startH), startM)
  const windowEnd = setMinutes(setHours(requestedDate, endH), endM)

  // Generate candidate slots every 30 min (or service duration if larger)
  const slotInterval = Math.min(30, service.duration)
  const candidateMinutes = eachMinuteOfInterval(
    { start: windowStart, end: addMinutes(windowEnd, -service.duration) },
    { step: slotInterval },
  )

  // Fetch existing appointments for that day
  const dayStart = setMinutes(setHours(requestedDate, 0), 0)
  const dayEnd = setMinutes(setHours(requestedDate, 23), 59)

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      professionalId: professional.id,
      status: { not: 'CANCELLED' },
      scheduledAt: { gte: dayStart, lte: dayEnd },
    },
    select: { scheduledAt: true, endsAt: true },
  })

  const slots = candidateMinutes.map((slotStart) => {
    const slotEnd = addMinutes(slotStart, service.duration)

    const hasConflict = existingAppointments.some((appt) => {
      const aStart = new Date(appt.scheduledAt)
      const aEnd = new Date(appt.endsAt)
      return slotStart < aEnd && slotEnd > aStart
    })

    return {
      time: format(slotStart, 'HH:mm'),
      available: !hasConflict,
    }
  })

  return NextResponse.json({ slots }, { headers: { 'Cache-Control': 'no-store, must-revalidate' } })
}

// ── POST: create booking from public page ──────────────────────────────────────

const bookingSchema = z.object({
  serviceId: z.string(),
  scheduledAt: z.string(),
  customer: z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    phone: z.string().min(10, 'Telefone inválido'),
    email: z.string().email().optional().or(z.literal('')),
  }),
  notes: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  try {
  return await handlePost(req, params)
  } catch (err) {
    console.error('[Booking POST] Unhandled error:', err)
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}

async function handlePost(
  req: NextRequest,
  params: { slug: string },
) {
  const professional = await prisma.professional.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      businessName: true,
      address: true,
      city: true,
      state: true,
      plan: true,
    },
  })

  if (!professional) {
    return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  let data: z.infer<typeof bookingSchema>
  try {
    data = bookingSchema.parse(body)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
  }

  const service = await prisma.service.findFirst({
    where: { id: data.serviceId, professionalId: professional.id, active: true },
  })
  if (!service) {
    return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
  }

  const scheduledAt = new Date(data.scheduledAt)
  const endsAt = addMinutes(scheduledAt, service.duration)

  // Check for conflicts
  const conflict = await prisma.appointment.findFirst({
    where: {
      professionalId: professional.id,
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
      { error: 'Horário indisponível. Por favor escolha outro horário.' },
      { status: 409 },
    )
  }

  // Upsert customer (by phone, unique per professional)
  const phone = data.customer.phone.replace(/\D/g, '')
  const customer = await prisma.customer.upsert({
    where: {
      professionalId_phone: {
        professionalId: professional.id,
        phone,
      },
    },
    update: {
      name: data.customer.name,
      email: data.customer.email || null,
    },
    create: {
      professionalId: professional.id,
      name: data.customer.name,
      phone,
      email: data.customer.email || null,
    },
  })

  const appointment = await prisma.appointment.create({
    data: {
      professionalId: professional.id,
      customerId: customer.id,
      serviceId: service.id,
      scheduledAt,
      endsAt,
      notes: data.notes,
      status: 'PENDING',
    },
    include: { customer: true, service: true },
  })

  const address = [professional.address, professional.city, professional.state]
    .filter(Boolean).join(', ')

  const confirmacaoData = {
    clientName: customer.name,
    serviceName: service.name,
    professionalName: professional.businessName ?? '',
    date: format(scheduledAt, 'dd/MM/yyyy'),
    time: format(scheduledAt, 'HH:mm'),
    address: address || undefined,
  }

  // Email de confirmação — todos os planos
  if (customer.email) {
    await sendConfirmacaoEmail({ ...confirmacaoData, clientEmail: customer.email })
  }

  return NextResponse.json(appointment, { status: 201, headers: { 'Cache-Control': 'no-store' } })
}

