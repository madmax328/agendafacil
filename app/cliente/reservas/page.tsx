'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2, Calendar, LogOut, Clock, MapPin, AlertCircle,
  ChevronRight, ArrowUpDown, CheckCircle2, Copy, Check, QrCode, Star,
} from 'lucide-react'
import { format, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency, toNaiveLocal } from '@/lib/utils'
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
    plan: string
    pixKey: string | null
  }
}

function RatingBlock({ appointmentId }: { appointmentId: string }) {
  const [hover, setHover] = useState(0)
  const [selected, setSelected] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit() {
    if (!selected) return
    setLoading(true)
    try {
      const res = await fetch('/api/cliente/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, rating: selected, comment }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error || 'Erro ao enviar avaliação', variant: 'destructive' })
        return
      }
      setSubmitted(true)
      toast({ title: 'Avaliação enviada! Obrigado.' })
    } catch {
      toast({ title: 'Erro inesperado', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 flex items-center gap-2 text-sm text-yellow-800">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        Avaliação enviada! Obrigado pelo feedback.
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 space-y-2">
      <p className="text-xs font-semibold text-yellow-800 flex items-center gap-1">
        <Star className="h-3.5 w-3.5" />
        Como foi o atendimento?
      </p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setSelected(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hover || selected)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      {selected > 0 && (
        <>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Comentário opcional..."
            rows={2}
            className="w-full text-xs rounded-lg border border-yellow-200 bg-white px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-yellow-400 text-yellow-900 text-xs font-bold hover:bg-yellow-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Enviar avaliação
          </button>
        </>
      )}
    </div>
  )
}

interface Customer {
  id: string
  email: string
  name: string
}

type SortKey = 'date-desc' | 'date-asc'

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'Aguardando', className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  CONFIRMED: { label: 'Confirmado', className: 'bg-green-100 text-green-800 border border-green-200' },
  CANCELLED: { label: 'Cancelado',  className: 'bg-gray-100 text-gray-600 border border-gray-200' },
  COMPLETED: { label: 'Concluído',  className: 'bg-blue-100 text-blue-800 border border-blue-200' },
}

const STATUS_FILTERS = [
  { key: 'ALL',       label: 'Todos' },
  { key: 'PENDING',   label: 'Aguardando' },
  { key: 'CONFIRMED', label: 'Confirmado' },
  { key: 'COMPLETED', label: 'Concluído' },
]

function canCancel(scheduledAt: string): boolean {
  const deadline = new Date(scheduledAt)
  deadline.setHours(deadline.getHours() - 24)
  return deadline > new Date()
}

function PixBlock({ pixKey }: { pixKey: string }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  async function copy() {
    try {
      await navigator.clipboard.writeText(pixKey)
      setCopied(true)
      toast({ title: 'Chave Pix copiada!' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Não foi possível copiar', variant: 'destructive' })
    }
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-800">
        <QrCode className="h-3.5 w-3.5" />
        Pague via Pix
      </div>
      <div className="flex items-center gap-2">
        <p className="flex-1 text-xs font-mono text-green-900 break-all">{pixKey}</p>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
          title="Copiar chave Pix"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

export default function ClienteReservasPage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [sort, setSort] = useState<SortKey>('date-desc')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
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
    let list = [...appointments]
    if (statusFilter !== 'ALL') list = list.filter(a => a.status === statusFilter)
    if (sort === 'date-desc') {
      // Upcoming appointments first (soonest next), then past most-recent-first
      const now = Date.now()
      list.sort((a, b) => {
        const aTime = new Date(a.scheduledAt).getTime()
        const bTime = new Date(b.scheduledAt).getTime()
        const aFuture = aTime >= now
        const bFuture = bTime >= now
        if (aFuture && bFuture) return aTime - bTime   // both future: soonest first
        if (!aFuture && !bFuture) return bTime - aTime  // both past: most recent first
        return aFuture ? -1 : 1                         // future before past
      })
    }
    if (sort === 'date-asc') list.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    return list
  }, [appointments, sort, statusFilter])

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

          {/* Left: logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="bg-blue-600 rounded-lg p-1 group-hover:bg-blue-700 transition-colors">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-extrabold text-gray-900 text-base">Markou</span>
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

        {/* Sort + filter controls */}
        {appointments.length > 0 && (
          <div className="space-y-2">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-xs text-gray-500 font-medium">Ordenar:</span>
              {([
                { key: 'date-desc' as SortKey, label: 'Próximos primeiro' },
                { key: 'date-asc'  as SortKey, label: 'Mais antigos primeiro' },
              ]).map(({ key, label }) => (
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

            {/* Status filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              {STATUS_FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    statusFilter === key
                      ? 'bg-gray-800 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {label}
                  {key !== 'ALL' && (
                    <span className="ml-1 opacity-60">
                      ({appointments.filter(a => a.status === key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
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
            {statusFilter !== 'ALL' ? (
              <>
                <p className="text-gray-500 font-medium">Nenhum agendamento com este status</p>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className="mt-4 text-sm text-blue-600 hover:underline font-medium"
                >
                  Ver todos
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-500 font-medium">Nenhum agendamento encontrado</p>
                <p className="text-sm text-gray-400 mt-1">Seus agendamentos aparecerão aqui.</p>
                <Link
                  href="/"
                  className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Encontrar profissionais
                </Link>
              </>
            )}
          </div>
        )}

        {/* Appointment cards */}
        {sorted.map((appt) => {
          const statusInfo = STATUS_LABELS[appt.status] ?? STATUS_LABELS.PENDING
          const scheduledDate = toNaiveLocal(appt.scheduledAt)
          const past = isPast(new Date(appt.scheduledAt))
          const showCancel = appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && canCancel(appt.scheduledAt)

          return (
            <div
              key={appt.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                past ? 'border-gray-100 opacity-70' : 'border-gray-200 hover:shadow-md'
              }`}
            >
              {/* Card header — professional info (name is a link to their page) */}
              <div className="flex items-center justify-between p-4 pb-3">
                <div className="min-w-0">
                  {appt.professional.slug ? (
                    <Link
                      href={`/${appt.professional.slug}`}
                      className="font-bold text-gray-900 hover:text-blue-600 transition-colors truncate block"
                    >
                      {appt.professional.businessName}
                    </Link>
                  ) : (
                    <p className="font-bold text-gray-900 truncate">{appt.professional.businessName}</p>
                  )}
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

                {/* Pix block — PRO professionals with pixKey */}
                {appt.professional.plan === 'PRO' && appt.professional.pixKey && (
                  <PixBlock pixKey={appt.professional.pixKey} />
                )}

                {/* Rating block — only for completed appointments */}
                {appt.status === 'COMPLETED' && (
                  <RatingBlock appointmentId={appt.id} />
                )}

                {/* Action buttons */}
                <div className={`grid gap-2 ${appt.professional.slug && showCancel ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {appt.professional.slug && (
                    <Link
                      href={`/${appt.professional.slug}`}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
                    >
                      Reservar novamente
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}

                  {showCancel && (
                    <button
                      type="button"
                      onClick={() => handleCancel(appt.id)}
                      disabled={cancellingId === appt.id}
                      className="py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                      {cancellingId === appt.id && <Loader2 className="h-4 w-4 animate-spin" />}
                      Cancelar
                    </button>
                  )}
                </div>
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
