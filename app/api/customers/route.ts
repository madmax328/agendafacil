import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''

  const customers = await prisma.customer.findMany({
    where: {
      professionalId: session.user.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { appointments: true } },
      appointments: {
        orderBy: { scheduledAt: 'desc' },
        take: 1,
        select: { scheduledAt: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const enriched = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    notes: c.notes,
    createdAt: c.createdAt,
    _count: c._count,
    lastAppointment: c.appointments[0]?.scheduledAt ?? null,
  }))

  return NextResponse.json(enriched)
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

  let data: z.infer<typeof createCustomerSchema>
  try {
    data = createCustomerSchema.parse(body)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
  }

  const phone = data.phone.replace(/\D/g, '')

  // Check for duplicate phone
  const existing = await prisma.customer.findUnique({
    where: { professionalId_phone: { professionalId: session.user.id, phone } },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'Já existe um cliente com este telefone' },
      { status: 409 },
    )
  }

  const customer = await prisma.customer.create({
    data: {
      professionalId: session.user.id,
      name: data.name,
      phone,
      email: data.email || null,
      notes: data.notes || null,
    },
    include: { _count: { select: { appointments: true } } },
  })

  return NextResponse.json({ ...customer, lastAppointment: null }, { status: 201 })
}
