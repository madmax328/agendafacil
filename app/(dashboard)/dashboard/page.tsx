import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  Plus,
  UserPlus,
  Clock,
  ChevronRight,
  Link2,
  ExternalLink,
} from 'lucide-react'
import Image from 'next/image'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatTime } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { CopyLinkButton } from '@/components/copy-link-button'
import { InlineStatusBadge } from '@/components/dashboard/inline-status-badge'

export const metadata = {
  title: 'Dashboard',
}


function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBg,
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground truncate">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`${iconBg} rounded-xl p-3 shrink-0 ml-4`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const professionalId = session.user.id
  const professional = await prisma.professional.findUnique({
    where: { id: professionalId },
    select: { slug: true, businessName: true },
  })
  const slug = professional?.slug ?? null
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://markou.app'
  const bookingUrl = slug ? `${baseUrl}/${slug}` : null

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  )
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )

  // Fetch all stats in parallel for performance
  const [
    appointmentsToday,
    completedThisMonth,
    totalCustomers,
    attendanceStats,
    upcomingAppointments,
  ] = await Promise.all([
    // Today's non-cancelled appointments
    prisma.appointment.count({
      where: {
        professionalId,
        scheduledAt: { gte: startOfToday, lte: endOfToday },
        status: { not: 'CANCELLED' },
      },
    }),

    // Completed appointments this month (with service price for revenue)
    prisma.appointment.findMany({
      where: {
        professionalId,
        scheduledAt: { gte: startOfMonth, lte: endOfMonth },
        status: 'COMPLETED',
      },
      include: { service: { select: { price: true } } },
    }),

    // Total customers for this professional
    prisma.customer.count({
      where: { professionalId },
    }),

    // Completed + cancelled this month for attendance rate
    prisma.appointment.groupBy({
      by: ['status'],
      where: {
        professionalId,
        scheduledAt: { gte: startOfMonth, lte: endOfMonth },
        status: { in: ['COMPLETED', 'CANCELLED'] },
      },
      _count: { id: true },
    }),

    // Next 5 upcoming appointments from now
    prisma.appointment.findMany({
      where: {
        professionalId,
        scheduledAt: { gte: startOfToday },
        status: { not: 'CANCELLED' },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
      include: {
        customer: { select: { name: true, phone: true } },
        service: { select: { name: true, duration: true } },
      },
    }),
  ])

  // Calculate revenue from completed appointments this month
  const revenue = completedThisMonth.reduce(
    (sum, appt) => sum + (appt.service.price ?? 0),
    0
  )

  // Attendance rate: completed / (completed + cancelled)
  const completed =
    attendanceStats.find((s) => s.status === 'COMPLETED')?._count.id ?? 0
  const cancelled =
    attendanceStats.find((s) => s.status === 'CANCELLED')?._count.id ?? 0
  const totalForRate = completed + cancelled
  const attendanceRate =
    totalForRate > 0 ? Math.round((completed / totalForRate) * 100) : 100

  const firstName = session.user.name?.split(' ')[0] ?? 'Profissional'

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Welcome heading + quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {firstName}!
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Bem-vindo ao seu painel de controle
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Link href="/agenda/novo">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href="/clientes">
              <UserPlus className="h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        </div>
      </div>

      {/* Public booking link banner */}
      {bookingUrl ? (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-blue-700 shrink-0">
              <Link2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Seu link de agendamento:</span>
            </div>
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <code className="flex-1 truncate text-sm bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-blue-800 font-mono select-all">
                {bookingUrl}
              </code>
              <CopyLinkButton url={bookingUrl} />
              <Button asChild size="sm" variant="outline" className="shrink-0 border-blue-200 text-blue-700 hover:bg-blue-100 gap-1">
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Abrir</span>
                </a>
              </Button>
            </div>
          </div>
          {/* QR Code for printing / display */}
          <details className="group">
            <summary className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-800 select-none list-none flex items-center gap-1">
              <span className="group-open:hidden">▶ Mostrar QR Code</span>
              <span className="hidden group-open:inline">▼ Ocultar QR Code</span>
            </summary>
            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-white border border-blue-200 rounded-xl p-3 inline-block">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(bookingUrl)}&size=160x160&margin=4`}
                  alt="QR Code para agendamento"
                  width={160}
                  height={160}
                  unoptimized
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs text-blue-700 font-medium">Imprima e cole no seu espaço para facilitar o agendamento.</p>
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(bookingUrl)}&size=400x400&margin=10`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Baixar QR Code em alta resolução
                </a>
              </div>
            </div>
          </details>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <Link2 className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Seu link de agendamento ainda não foi configurado.{' '}
            <Link href="/configuracoes" className="font-semibold underline hover:no-underline">
              Complete seu perfil
            </Link>{' '}
            para ativar sua página pública.
          </p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Agendamentos hoje"
          value={String(appointmentsToday)}
          description="Consultas não canceladas"
          icon={Calendar}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Receita do mês"
          value={formatCurrency(revenue)}
          description="Serviços concluídos"
          icon={TrendingUp}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Total de clientes"
          value={String(totalCustomers)}
          description="Clientes cadastrados"
          icon={Users}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Taxa de comparecimento"
          value={`${attendanceRate}%`}
          description="Este mês"
          icon={CheckCircle2}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Today's schedule — rectangular timeline rows */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-base font-bold text-gray-900">Agenda de hoje</p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              <Link href="/agenda">Ver agenda <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="space-y-2">
            {upcomingAppointments.map((appt, i) => {
              const bars = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500']
              const bar = bars[i % bars.length]
              const initials = appt.customer.name.split(' ').slice(0,2).map((n: string) => n[0]).join('').toUpperCase()
              return (
                <Link
                  key={appt.id}
                  href={`/agenda/${appt.id}`}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm bg-gray-50 hover:bg-white transition-all group"
                >
                  <div className={`w-1 self-stretch rounded-full ${bar} shrink-0`} />
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-sm font-bold text-gray-800 tabular-nums">{formatTime(appt.scheduledAt)}</p>
                    <p className="text-[10px] text-gray-400">{appt.service.duration} min</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600 shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{appt.customer.name}</p>
                    <p className="text-xs text-gray-500 truncate">{appt.service.name}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 shrink-0" />
                </Link>
              )
            })}
            <Link
              href="/agenda/novo"
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-gray-400 hover:text-blue-500"
            >
              <Plus className="h-4 w-4" />
              <p className="text-xs font-medium">Novo agendamento</p>
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming appointments list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg">Próximos agendamentos</CardTitle>
            <CardDescription>
              Seus próximos atendimentos a partir de hoje
            </CardDescription>
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Link href="/agenda">
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-blue-50 rounded-full p-4 mb-4">
                <Calendar
                  className="h-8 w-8 text-blue-400"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Nenhum agendamento para hoje
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Crie um novo agendamento para começar
              </p>
              <Button
                asChild
                size="sm"
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Link href="/agenda/novo">
                  <Plus className="h-4 w-4" />
                  Novo Agendamento
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcomingAppointments.map((appointment) => (
                <li key={appointment.id} className="flex items-center gap-4 py-3 px-1">
                  {/* Customer avatar with initials */}
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                      {getInitials(appointment.customer.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Customer + service info — links to detail */}
                  <Link href={`/agenda/${appointment.id}`} className="flex-1 min-w-0 hover:opacity-75 transition-opacity">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {appointment.customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {appointment.service.name}
                    </p>
                  </Link>

                  {/* Time + inline status badge */}
                  <div className="shrink-0 text-right space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(appointment.scheduledAt)}</span>
                    </div>
                    <div className="flex justify-end">
                      <InlineStatusBadge
                        appointmentId={appointment.id}
                        currentStatus={appointment.status}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
