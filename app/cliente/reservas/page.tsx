'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Calendar, LogOut, Clock, MapPin, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface Appointment {
  id: string
  scheduledAt: string
  endsAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  service: {
    name: string
    duration: number
    price: number
  }
  professional: {
    businessName: string
    city: string | null
    state: string | null
    address: string | null
    phone: string | null
  }
}

interface Customer {
  id: string
  email: string
  name: string
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Aguardando', className: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  CONFIRMED: { label: 'Confirmado', className: 'bg-green-100 text-green-800 border border-green-200' },
  CANCELLED: { label: 'Cancelado', className: 'bg-gray-100 text-gray-600 border border-gray-200' },
  COMPLETED: { label: 'Concluído', className: 'bg-blue-100 text-blue-800 border border-blue-200' },
}

function canCancel(scheduledAt: string): boolean {
  const deadline = new Date(scheduledAt)
  deadline.setHours(deadline.getHours() - 24)
  return deadline > new Date()
}

export default function ClienteReservasPage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/cliente/me')
        if (!meRes.ok) {
          router.push('/cliente/login')
          return
        }
        const me = await meRes.json()
        setCustomer(me)

        const reservasRes = await fetch('/api/cliente/reservas')
        if (reservasRes.ok) {
          const data = await reservasRes.json()
          setAppointments(data)
        }
      } catch {
        router.push('/cliente/login')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  async function handleLogout() {
    await fetch('/api/cliente/me', { method: 'DELETE' })
    router.push('/cliente/login')
  }

  async function handleCancel(id: string) {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return
    try {
      setCancellingId(id)
      const res = await fetch(`/api/cliente/reservas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error || 'Erro ao cancelar', variant: 'destructive' })
        return
      }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-base font-bold text-gray-900">Minhas Reservas</h1>
              {customer && <p className="text-xs text-gray-500">{customer.name}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-blue-700">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>Alterações em agendamentos só são permitidas até 24h antes. Após isso, entre em contato com o profissional.</p>
        </div>

        {/* Appointments list */}
        {appointments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-medium">Nenhum agendamento encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Seus agendamentos aparecerão aqui.</p>
          </div>
        ) : (
          appointments.map((appt) => {
            const statusInfo = STATUS_LABELS[appt.status] ?? STATUS_LABELS.PENDING
            const showCancel = appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && canCancel(appt.scheduledAt)
            const scheduledDate = new Date(appt.scheduledAt)

            return (
              <div key={appt.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                {/* Status + Professional */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{appt.professional.businessName}</p>
                    {(appt.professional.city || appt.professional.state) && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {[appt.professional.city, appt.professional.state].filter(Boolean).join(' – ')}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Service + Date */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">{appt.service.name}</span>
                      <span className="text-gray-500 ml-2">{appt.service.duration} min — {formatCurrency(appt.service.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 capitalize">
                      {format(scheduledDate, "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>

                {/* Cancel button */}
                {showCancel && (
                  <button
                    type="button"
                    onClick={() => handleCancel(appt.id)}
                    disabled={cancellingId === appt.id}
                    className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    {cancellingId === appt.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    Cancelar agendamento
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
