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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CopyLinkButton } from '@/components/copy-link-button'

export const metadata = {
  title: 'Dashboard',
}

// Status badge labels in Portuguese
const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

const statusVariants: Record<
  string,
  'default' | 'secondary' | 'success' | 'destructive' | 'outline' | 'warning' | 'info'
> = {
  PENDING: 'info',
  CONFIRMED: 'success',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
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
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://agendafacil.com.br'
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
        service: { select: { name: true } },
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
            <Link href="/clientes/novo">
              <UserPlus className="h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        </div>
      </div>

      {/* Public booking link banner */}
      {bookingUrl ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
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
                <li key={appointment.id}>
                  <Link
                    href={`/agenda/${appointment.id}`}
                    className="flex items-center gap-4 py-3 px-1 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    {/* Customer avatar with initials */}
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                        {getInitials(appointment.customer.name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Customer + service info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {appointment.customer.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {appointment.service.name}
                      </p>
                    </div>

                    {/* Time + status */}
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(appointment.scheduledAt)}</span>
                      </div>
                      <Badge
                        variant={
                          statusVariants[appointment.status] ?? 'secondary'
                        }
                        className="mt-1 text-[10px] px-1.5"
                      >
                        {statusLabels[appointment.status] ?? appointment.status}
                      </Badge>
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 group-hover:text-gray-500 transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
