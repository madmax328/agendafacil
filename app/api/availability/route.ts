import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const availabilityRowSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  active: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM inválido'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM inválido'),
})

const upsertSchema = z.array(availabilityRowSchema)

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const availability = await prisma.availability.findMany({
    where: { professionalId: session.user.id },
    orderBy: { dayOfWeek: 'asc' },
  })

  return NextResponse.json(availability)
}

export async function PUT(req: NextRequest) {
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

  let rows: z.infer<typeof upsertSchema>
  try {
    rows = upsertSchema.parse(body)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
  }

  // Upsert each row
  await Promise.all(
    rows.map((row) =>
      prisma.availability.upsert({
        where: {
          professionalId_dayOfWeek: {
            professionalId: session.user.id,
            dayOfWeek: row.dayOfWeek,
          },
        },
        update: {
          active: row.active,
          startTime: row.startTime,
          endTime: row.endTime,
        },
        create: {
          professionalId: session.user.id,
          dayOfWeek: row.dayOfWeek,
          active: row.active,
          startTime: row.startTime,
          endTime: row.endTime,
        },
      }),
    ),
  )

  return NextResponse.json({ ok: true })
}
