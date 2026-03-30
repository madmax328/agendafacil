import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  parseISO,
  eachDayOfInterval,
  format,
  setHours,
  setMinutes,
  addMinutes,
  startOfDay,
  endOfDay,
} from 'date-fns'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get('serviceId')
  const startParam = searchParams.get('start')
  const endParam = searchParams.get('end')

  if (!serviceId || !startParam || !endParam) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const professional = await prisma.professional.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      availability: true,
    },
  })

  if (!professional) {
    return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, professionalId: professional.id, active: true },
    select: { duration: true },
  })

  if (!service) {
    return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
  }

  const rangeStart = parseISO(startParam)
  const rangeEnd = parseISO(endParam)
  const today = startOfDay(new Date())

  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd })

  const availableDates: string[] = []

  for (const day of days) {
    // Skip past dates
    if (day < today) continue

    const dayOfWeek = day.getDay()
    const avail = professional.availability.find(
      (a) => a.dayOfWeek === dayOfWeek && a.active,
    )
    if (!avail) continue

    // Check if at least one slot is free
    const [startH, startM] = avail.startTime.split(':').map(Number)
    const [endH, endM] = avail.endTime.split(':').map(Number)

    const windowStart = setMinutes(setHours(day, startH), startM)
    const windowEnd = setMinutes(setHours(day, endH), endM)

    // Get existing appointments for the day
    const existing = await prisma.appointment.findMany({
      where: {
        professionalId: professional.id,
        status: { not: 'CANCELLED' },
        scheduledAt: { gte: startOfDay(day), lte: endOfDay(day) },
      },
      select: { scheduledAt: true, endsAt: true },
    })

    // Try to find at least one free slot
    let current = windowStart
    let hasSlot = false
    while (current <= addMinutes(windowEnd, -service.duration)) {
      const slotEnd = addMinutes(current, service.duration)
      const conflict = existing.some((a) => {
        const aStart = new Date(a.scheduledAt)
        const aEnd = new Date(a.endsAt)
        return current < aEnd && slotEnd > aStart
      })
      if (!conflict) {
        hasSlot = true
        break
      }
      current = addMinutes(current, 30)
    }

    if (hasSlot) {
      availableDates.push(format(day, 'yyyy-MM-dd'))
    }
  }

  return NextResponse.json(availableDates)
}
