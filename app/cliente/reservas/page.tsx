'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, Calendar, LogOut, Clock, MapPin, AlertCircle,
  ChevronRight, ArrowUpDown, CheckCircle2,
} from 'lucide-react'
import { format, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface Appointment {
  id: string
  scheduledAt: string
  endsAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  service: { name: string; duration: number; price: number }
  professional: {
    businessName: string
    city: string | null
    state: string | null
    address: string | null
    phone: string | null
    slug: string | null
  }
}

interface Customer {
  id: string
  email: string
  name: string
}

type SortKey = 'date-desc' | 'date-asc' | 'status'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'Aguardando', className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  CONFIRMED: { label: 'Confirmado', className: 'bg-green-100 text-green-800 border border-green-200' },
  CANCELLED: { label: 'Cancelado',  className: 'bg-gray-100 text-gray-600 border border-gray-200' },
  COMPLETED: { label: 'Concluído',  className: 'bg-blue-100 text-blue-800 border border-blue-200' },
}

const STATUS_ORDER: Record<string, number> = { CONFIRMED: 0, PENDING: 1, COMPLETED: 2, CANCELLED: 3 }

function canCancel(scheduledAt: string): boolean {
  const deadline = new Date(scheduledAt)
  deadline.setHours(deadline.getHours() - 24)
  return deadline > new Date()
}

export default function ClienteReservasPage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('date-desc')
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/cliente/me')
        if (!meRes.ok) { router.push('/cliente/login'); return }
        setCustomer(await meRes.json())

        const res = await fetch('/api/cliente/reservas')
        if (res.ok) {
          setAppointments(await res.json())
        } else {
          const err = await res.json().catch(() => ({}))
          setApiError(`Erro ${res.status}: ${err.error ?? 'Falha ao carregar reservas'}`)
        }
      } catch {
        router.push('/cliente/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const sorted = useMemo(() => {
    const list = [...appointments]
    if (sort === 'date-asc')  list.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    if (sort === 'date-desc') list.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    if (sort === 'status')    list.sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9))
    return list
  }, [appointments, sort])

  async function handleLogout() {
    await fetch('/api/cliente/me', { method: 'DELETE' })
    router.push('/cliente/login')
  }

  async function handleCancel(id: string) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return
    setCancellingId(id)
    try {
      const res = await fetch(`/api/cliente/reservas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const data = await res.json()
      if (!res.ok) { toast({ title: data.error || 'Erro ao cancelar', variant: 'destructive' }); return }
      setAppointments(prev => prev.filter(a => a.id !== id))
      toast({ title: 'Agendamento cancelado com sucesso.' })
    } catch {
      toast({ title: 'Erro inesperado ao cancelar', variant: 'destructive' })
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Left: logo + Início */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="bg-blue-600 rounded-lg p-1 group-hover:bg-blue-700 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-gray-900 text-base">Markou</span>
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
              Início
            </Link>
          </div>

          {/* Center: page title */}
          <h1 className="text-sm font-bold text-gray-900 absolute left-1/2 -translate-x-1/2 pointer-events-none">
            Minhas Reservas
          </h1>

          {/* Right: logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">

        {/* Customer greeting */}
        {customer && (
          <p className="text-sm text-gray-500">
            Olá, <span className="font-semibold text-gray-800">{customer.name}</span>
          </p>
        )}

        {/* Sort controls */}
        {appointments.length > 0 && (
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 font-medium">Ordenar:</span>
            {([
              { key: 'date-desc', label: 'Mais recentes' },
              { key: 'date-asc',  label: 'Mais antigos' },
              { key: 'status',    label: 'Por status' },
            ] as { key: SortKey; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  sort === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Error banner */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>{apiError}</p>
          </div>
        )}

        {/* Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-blue-700">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Cancelamentos só são permitidos até 24h antes do horário agendado.</p>
        </div>

        {/* Empty state */}
        {sorted.length === 0 && !apiError && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-medium">Nenhum agendamento encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Seus agendamentos aparecerão aqui.</p>
            <Link
              href="/"
              className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Encontrar profissionais
            </Link>
          </div>
        )}

        {/* Appointment cards */}
        {sorted.map((appt) => {
          const statusInfo = STATUS_LABELS[appt.status] ?? STATUS_LABELS.PENDING
          const scheduledDate = new Date(appt.scheduledAt)
          const past = isPast(scheduledDate)
          const showCancel = appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && canCancel(appt.scheduledAt)

          return (
            <div
              key={appt.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                past ? 'border-gray-100 opacity-70' : 'border-gray-200 hover:border-blue-200 hover:shadow-md'
              }`}
            >
              {/* Card header — click to go to professional */}
              {appt.professional.slug ? (
                <Link
                  href={`/${appt.professional.slug}`}
                  className="flex items-center justify-between p-4 pb-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {appt.professional.businessName}
                    </p>
                    {(appt.professional.city || appt.professional.state) && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {[appt.professional.city, appt.professional.state].filter(Boolean).join(' – ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              ) : (
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{appt.professional.businessName}</p>
                    {(appt.professional.city || appt.professional.state) && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {[appt.professional.city, appt.professional.state].filter(Boolean).join(' – ')}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ml-3 ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>
              )}

              {/* Card body */}
              <div className="px-4 pb-4 space-y-3">
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="font-semibold text-gray-900">{appt.service.name}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">{appt.service.duration} min</span>
                    <span className="text-gray-400">·</span>
                    <span className="font-medium text-green-700">{formatCurrency(appt.service.price)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className={`capitalize ${past ? 'text-gray-400' : 'text-gray-700'}`}>
                      {format(scheduledDate, "EEE, dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {showCancel && (
                  <button
                    type="button"
                    onClick={() => handleCancel(appt.id)}
                    disabled={cancellingId === appt.id}
                    className="w-full py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {cancellingId === appt.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    Cancelar agendamento
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-500 py-8 mt-8">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-xl p-1">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Markou</span>
          </div>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Markou. Todos os direitos reservados.</p>
          <div className="flex gap-5 text-xs">
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/para-profissionais" className="hover:text-white transition-colors">Para profissionais</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
