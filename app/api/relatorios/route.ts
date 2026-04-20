import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfMonth, subMonths, endOfMonth, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const professionalId = session.user.id
  const now = new Date()

  // Last 6 months range
  const sixMonthsAgo = startOfMonth(subMonths(now, 5))

  const appointments = await prisma.appointment.findMany({
    where: {
      professionalId,
      scheduledAt: { gte: sixMonthsAgo },
    },
    include: {
      service: { select: { name: true, price: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  // Build month buckets (last 6 months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i)
    return {
      key: format(d, 'yyyy-MM'),
      label: format(d, 'MMM', { locale: ptBR }),
      start: startOfMonth(d),
      end: endOfMonth(d),
    }
  })

  const byMonth = months.map(({ key, label, start, end }) => {
    const appts = appointments.filter(a => {
      const d = new Date(a.scheduledAt)
      return d >= start && d <= end && a.status !== 'CANCELLED'
    })
    return {
      month: label,
      key,
      total: appts.length,
      revenue: appts.filter(a => a.status === 'COMPLETED').reduce((s, a) => s + a.service.price, 0),
    }
  })

  // Total customers (unique)
  const totalCustomers = await prisma.customer.count({ where: { professionalId } })

  // Service breakdown
  const serviceMap = new Map<string, { name: string; count: number; revenue: number }>()
  appointments.forEach(a => {
    if (a.status === 'CANCELLED') return
    const prev = serviceMap.get(a.serviceId) ?? { name: a.service.name, count: 0, revenue: 0 }
    serviceMap.set(a.serviceId, {
      name: prev.name,
      count: prev.count + 1,
      revenue: prev.revenue + (a.status === 'COMPLETED' ? a.service.price : 0),
    })
  })
  const topServices = Array.from(serviceMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Current month summary
  const currentMonthStart = startOfMonth(now)
  const thisMonthAppts = appointments.filter(a =>
    new Date(a.scheduledAt) >= currentMonthStart && a.status !== 'CANCELLED'
  )
  const completedThisMonth = thisMonthAppts.filter(a => a.status === 'COMPLETED')
  const cancelledThisMonth = appointments.filter(a =>
    new Date(a.scheduledAt) >= currentMonthStart && a.status === 'CANCELLED'
  )
  const total = thisMonthAppts.length + cancelledThisMonth.length

  return NextResponse.json({
    byMonth,
    topServices,
    summary: {
      appointmentsThisMonth: thisMonthAppts.length,
      revenueThisMonth: completedThisMonth.reduce((s, a) => s + a.service.price, 0),
      totalCustomers,
      cancellationRate: total > 0 ? Math.round((cancelledThisMonth.length / total) * 100) : 0,
    },
  })
}
