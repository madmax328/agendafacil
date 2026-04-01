'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Loader2,
  User,
  Calendar,
  Clock,
  Scissors,
  FileText,
  Trash2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Status = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

interface Appointment {
  id: string
  scheduledAt: string
  endsAt: string
  status: Status
  notes: string | null
  customer: { id: string; name: string; phone: string; email: string | null }
  service: { id: string; name: string; duration: number; price: number }
}

const STATUS_LABELS: Record<Status, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

const STATUS_VARIANTS: Record<Status, 'default' | 'secondary' | 'success' | 'destructive' | 'info' | 'warning'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
}

const STATUS_ACTIONS: { status: Status; label: string; color: string }[] = [
  { status: 'CONFIRMED', label: 'Confirmar', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { status: 'COMPLETED', label: 'Concluído', color: 'bg-green-600 hover:bg-green-700 text-white' },
  { status: 'CANCELLED', label: 'Cancelar', color: 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' },
  { status: 'PENDING', label: 'Pendente', color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200' },
]

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/appointments?id=${id}`)
        // The GET /api/appointments returns a list — find by id
        if (res.ok) {
          const all: Appointment[] = await res.json()
          const found = all.find((a) => a.id === id)
          if (found) setAppointment(found)
          else setAppointment(null)
        }
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  async function handleStatusChange(status: Status) {
    if (!appointment) return
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setAppointment((prev) => prev ? { ...prev, status } : prev)
      toast({ title: `Status atualizado: ${STATUS_LABELS[status]}` })
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast({ title: 'Agendamento removido.' })
      router.push('/agenda')
    } catch {
      toast({ title: 'Erro ao remover agendamento', variant: 'destructive' })
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Agendamento não encontrado</h2>
        <p className="text-gray-500 mb-6">Este agendamento não existe ou foi removido.</p>
        <Button asChild variant="outline">
          <Link href="/agenda">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para a agenda
          </Link>
        </Button>
      </div>
    )
  }

  const start = parseISO(appointment.scheduledAt)
  const end = parseISO(appointment.endsAt)
  const dateFormatted = format(start, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const timeFormatted = `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/agenda"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para a agenda
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Detalhe do Agendamento</h1>
          <Badge variant={STATUS_VARIANTS[appointment.status]}>
            {STATUS_LABELS[appointment.status]}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {/* Main info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {/* Customer */}
          <div className="flex items-start gap-4 p-5">
            <div className="bg-blue-100 rounded-xl p-2.5 shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Cliente</p>
              <p className="font-semibold text-gray-900">{appointment.customer.name}</p>
              <p className="text-sm text-gray-500">{appointment.customer.phone}</p>
              {appointment.customer.email && (
                <p className="text-sm text-gray-500">{appointment.customer.email}</p>
              )}
            </div>
          </div>

          {/* Service */}
          <div className="flex items-start gap-4 p-5">
            <div className="bg-purple-100 rounded-xl p-2.5 shrink-0">
              <Scissors className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Serviço</p>
              <p className="font-semibold text-gray-900">{appointment.service.name}</p>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {appointment.service.duration} min
                </span>
                <span className="font-medium text-green-700">
                  {formatCurrency(appointment.service.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Date/Time */}
          <div className="flex items-start gap-4 p-5">
            <div className="bg-orange-100 rounded-xl p-2.5 shrink-0">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Data e horário</p>
              <p className="font-semibold text-gray-900 capitalize">{dateFormatted}</p>
              <p className="text-sm text-gray-500">{timeFormatted}</p>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="flex items-start gap-4 p-5">
              <div className="bg-gray-100 rounded-xl p-2.5 shrink-0">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Observações</p>
                <p className="text-sm text-gray-700">{appointment.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Status change */}
        {appointment.status !== 'CANCELLED' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Alterar status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_ACTIONS.filter((a) => a.status !== appointment.status).map((action) => (
                <button
                  key={action.status}
                  type="button"
                  disabled={statusLoading}
                  onClick={() => handleStatusChange(action.status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${action.color}`}
                >
                  {statusLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Delete */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remover agendamento
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 font-medium">
                Tem certeza que deseja remover este agendamento?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Remover
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
