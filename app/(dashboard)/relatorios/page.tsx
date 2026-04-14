'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Loader2, TrendingUp, Users, CalendarCheck, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface MonthData {
  month: string
  total: number
  revenue: number
}

interface ServiceData {
  name: string
  count: number
  revenue: number
}

interface Summary {
  appointmentsThisMonth: number
  revenueThisMonth: number
  totalCustomers: number
  cancellationRate: number
}

interface ReportData {
  byMonth: MonthData[]
  topServices: ServiceData[]
  summary: Summary
}

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function RelatoriosPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const plan = (session?.user?.plan as string) ?? 'FREE'
  const hasAccess = plan === 'PRO'

  useEffect(() => {
    if (!hasAccess) return
    fetch('/api/relatorios')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [hasAccess])

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <TrendingUp className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatórios & Analytics</h1>
        <p className="text-gray-500 mb-6">
          Este recurso está disponível exclusivamente no plano <strong>Pro</strong>.
          Visualize receita, agendamentos e desempenho por serviço.
        </p>
        <button
          onClick={() => router.push('/assinatura')}
          className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
        >
          Ver plano Pro
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Erro ao carregar relatórios. Tente novamente.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-sm text-gray-500 mt-1">Desempenho dos últimos 6 meses</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<CalendarCheck className="h-5 w-5 text-blue-600" />}
          label="Agendamentos (mês)"
          value={String(data.summary.appointmentsThisMonth)}
          sub="mês atual"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          label="Receita (mês)"
          value={formatCurrency(data.summary.revenueThisMonth)}
          sub="mês atual"
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-purple-600" />}
          label="Total de clientes"
          value={String(data.summary.totalCustomers)}
          sub="cadastrados"
        />
        <StatCard
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          label="Taxa de cancelamento"
          value={`${data.summary.cancellationRate}%`}
          sub="mês atual"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Appointments by month */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Agendamentos por mês</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.byMonth} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v: number) => [v, 'Agendamentos']}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by month */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Receita por mês (R$)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.byMonth} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v: number) => [formatCurrency(v), 'Receita']}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top services */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Serviços mais realizados</h2>
        {data.topServices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum dado disponível ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase pb-3">Serviço</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-3">Agendamentos</th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase pb-3">Receita total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.topServices.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="py-3 text-right text-gray-600">{s.count}</td>
                    <td className="py-3 text-right font-semibold text-green-700">{formatCurrency(s.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
