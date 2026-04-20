import { prisma } from '@/lib/prisma'
import { Users, Calendar, CreditCard, MessageSquare, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const [
    totalPros,
    prosByPlan,
    totalAppointments,
    thisMonthAppointments,
    recentPros,
    openTickets,
  ] = await Promise.all([
    prisma.professional.count(),
    prisma.professional.groupBy({ by: ['plan'], _count: { _all: true } }),
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        scheduledAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.professional.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, name: true, businessName: true, email: true, plan: true, createdAt: true },
    }),
    (prisma as any).supportMessage.count({ where: { status: 'open' } }),
  ])

  const planCounts = Object.fromEntries(prosByPlan.map(p => [p.plan, p._count._all]))

  const stats = [
    { label: 'Profissionais', value: totalPros, icon: Users, color: 'bg-blue-500' },
    { label: 'Agendamentos (total)', value: totalAppointments, icon: Calendar, color: 'bg-violet-500' },
    { label: 'Agendamentos (mês)', value: thisMonthAppointments, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Tickets abertos', value: openTickets, icon: MessageSquare, color: 'bg-amber-500' },
  ]

  const planLabels: Record<string, string> = { FREE: 'Gratuito', STARTER: 'Starter', PRO: 'Pro' }
  const planColors: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600',
    STARTER: 'bg-blue-100 text-blue-700',
    PRO: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral da plataforma Markou</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`${s.color} rounded-xl p-2.5`}>
              <s.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plans breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">Planos</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {['FREE', 'STARTER', 'PRO'].map(plan => (
            <div key={plan} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-3xl font-bold text-gray-900">{planCounts[plan] ?? 0}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${planColors[plan]}`}>
                {planLabels[plan]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sign-ups */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">Inscrições recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plano</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentPros.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{p.businessName || p.name || '—'}</td>
                  <td className="py-2.5 px-3 text-gray-500">{p.email}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${planColors[p.plan]}`}>
                      {planLabels[p.plan]}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
