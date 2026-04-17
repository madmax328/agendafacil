'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Loader2,
  Calendar,
  LayoutGrid,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency, toNaiveLocal } from '@/lib/utils'
import {
  addDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  parseISO,
  differenceInMinutes,
  setHours,
  setMinutes,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── Types ──────────────────────────────────────────────────────────────────────

interface AppointmentService {
  id: string
  name: string
  duration: number
  price: number
}

interface AppointmentCustomer {
  id: string
  name: string
  phone: string
}

interface Appointment {
  id: string
  scheduledAt: string
  endsAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes: string | null
  customer: AppointmentCustomer
  service: AppointmentService
}

// ── Constants ──────────────────────────────────────────────────────────────────

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 07:00 – 20:00
const SLOT_HEIGHT = 64 // px per hour

const STATUS_COLORS: Record<Appointment['status'], string> = {
  PENDING: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  CONFIRMED: 'bg-blue-100 border-blue-400 text-blue-800',
  CANCELLED: 'bg-red-100 border-red-300 text-red-700 opacity-60',
  COMPLETED: 'bg-green-100 border-green-400 text-green-800',
}

const STATUS_LABELS: Record<Appointment['status'], string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
}

// ── Appointment Card (Week view) ───────────────────────────────────────────────

interface AppointmentCardProps {
  appointment: Appointment
  dayStart: Date
  onClick: (a: Appointment) => void
}

function AppointmentCard({ appointment, dayStart, onClick }: AppointmentCardProps) {
  const start = toNaiveLocal(appointment.scheduledAt)
  const end = toNaiveLocal(appointment.endsAt)

  // Position relative to 07:00 of that day
  const dayBase = setMinutes(setHours(dayStart, 7), 0)
  const topMin = differenceInMinutes(start, dayBase)
  const durationMin = differenceInMinutes(end, start)

  const topPx = (topMin / 60) * SLOT_HEIGHT
  const heightPx = Math.max((durationMin / 60) * SLOT_HEIGHT, 24)

  const colorClass = STATUS_COLORS[appointment.status]

  return (
    <button
      type="button"
      className={`absolute left-0.5 right-0.5 rounded border-l-4 px-1.5 py-1 text-left overflow-hidden cursor-pointer hover:brightness-95 transition-all ${colorClass}`}
      style={{ top: topPx, height: heightPx }}
      onClick={() => onClick(appointment)}
      title={`${appointment.customer.name} – ${appointment.service.name}`}
    >
      <p className="text-xs font-semibold truncate leading-tight">{appointment.customer.name}</p>
      {heightPx > 32 && (
        <p className="text-xs truncate leading-tight opacity-80">{appointment.service.name}</p>
      )}
      {heightPx > 48 && (
        <p className="text-xs opacity-70">
          {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
        </p>
      )}
    </button>
  )
}

// ── Detail Modal ───────────────────────────────────────────────────────────────

interface DetailModalProps {
  appointment: Appointment | null
  onClose: () => void
  onStatusChange: (id: string, status: Appointment['status']) => void
}

function DetailModal({ appointment, onClose, onStatusChange }: DetailModalProps) {
  if (!appointment) return null
  const start = toNaiveLocal(appointment.scheduledAt)
  const end = toNaiveLocal(appointment.endsAt)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Detalhes do Agendamento</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">{appointment.customer.name}</p>
              <p className="text-gray-500">{appointment.customer.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">{appointment.service.name}</p>
              <p className="text-gray-500">
                {format(start, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} –{' '}
                {format(end, 'HH:mm')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700">
              {appointment.service.duration} min &mdash; {formatCurrency(appointment.service.price)}
            </span>
          </div>

          {appointment.notes && (
            <div className="bg-gray-50 rounded-lg p-3 text-gray-600 text-xs">
              {appointment.notes}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Alterar status
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_LABELS) as Appointment['status'][]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { onStatusChange(appointment.id, s); onClose() }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  appointment.status === s
                    ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-blue-400'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  )
}

// ── Day view list ──────────────────────────────────────────────────────────────

interface DayViewProps {
  appointments: Appointment[]
  selectedDay: Date
  onAppointmentClick: (a: Appointment) => void
}

function DayView({ appointments, selectedDay, onAppointmentClick }: DayViewProps) {
  const dayAppts = appointments
    .filter((a) => isSameDay(parseISO(a.scheduledAt), selectedDay))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))

  if (dayAppts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-200" />
        <p className="text-sm">Nenhum agendamento para este dia.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {dayAppts.map((appt) => {
        const start = toNaiveLocal(appt.scheduledAt)
        const end = toNaiveLocal(appt.endsAt)
        return (
          <button
            key={appt.id}
            type="button"
            className="w-full flex items-start gap-4 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
            onClick={() => onAppointmentClick(appt)}
          >
            <div className="flex-shrink-0 text-right w-16">
              <p className="text-sm font-semibold text-gray-800">{format(start, 'HH:mm')}</p>
              <p className="text-xs text-gray-400">{format(end, 'HH:mm')}</p>
            </div>
            <div
              className={`flex-shrink-0 w-1 self-stretch rounded-full ${
                appt.status === 'CONFIRMED' ? 'bg-blue-400' :
                appt.status === 'COMPLETED' ? 'bg-green-400' :
                appt.status === 'CANCELLED' ? 'bg-red-300' : 'bg-yellow-400'
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{appt.customer.name}</p>
              <p className="text-sm text-gray-500 truncate">{appt.service.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400">
                  {appt.service.duration} min
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {formatCurrency(appt.service.price)}
                </span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[appt.status]}`}
                >
                  {STATUS_LABELS[appt.status]}
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }))
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const { toast } = useToast()

  const weekEnd = useMemo(() => endOfWeek(currentWeek, { weekStartsOn: 0 }), [currentWeek])

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/appointments?start=${currentWeek.toISOString()}&end=${weekEnd.toISOString()}`,
      )
      if (res.ok) setAppointments(await res.json())
    } finally {
      setLoading(false)
    }
  }, [currentWeek, weekEnd])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  function prevWeek() {
    setCurrentWeek((w) => subWeeks(w, 1))
  }
  function nextWeek() {
    setCurrentWeek((w) => addWeeks(w, 1))
  }
  function goToday() {
    const now = new Date()
    setCurrentWeek(startOfWeek(now, { weekStartsOn: 0 }))
    setSelectedDay(now)
  }

  async function handleStatusChange(id: string, status: Appointment['status']) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
      toast({ title: 'Status atualizado!' })
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    }
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

  const weekLabel = `${format(currentWeek, "dd 'de' MMM", { locale: ptBR })} – ${format(weekEnd, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}`

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 bg-white">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Day/Week toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'day' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Dia
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Semana
            </button>
          </div>

          {/* Navigation */}
          <button
            type="button"
            onClick={prevWeek}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:block">
            {weekLabel}
          </span>

          <button
            type="button"
            onClick={nextWeek}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="hidden sm:flex"
          >
            Hoje
          </Button>

          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <Link href="/agenda/novo">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Novo Agendamento</span>
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1 py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : viewMode === 'day' ? (
        /* ─── Day view ─── */
        <div className="flex-1 overflow-auto">
          {/* Day picker strip */}
          <div className="flex border-b border-gray-100 bg-white overflow-x-auto">
            {weekDays.map((day) => (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`flex-1 min-w-[60px] flex flex-col items-center py-3 text-sm font-medium transition-colors border-b-2 ${
                  isSameDay(day, selectedDay)
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <span className="text-xs text-gray-400">{DAYS_PT[day.getDay()]}</span>
                <span
                  className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    isToday(day) ? 'bg-blue-600 text-white' : ''
                  } ${isSameDay(day, selectedDay) && !isToday(day) ? 'font-bold text-blue-600' : ''}`}
                >
                  {format(day, 'd')}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white max-w-2xl mx-auto">
            <DayView
              appointments={appointments}
              selectedDay={selectedDay}
              onAppointmentClick={setSelectedAppointment}
            />
          </div>
        </div>
      ) : (
        /* ─── Week view grid ─── */
        <div className="flex-1 overflow-auto">
          <div className="min-w-[600px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="py-3" /> {/* time gutter */}
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`py-3 text-center border-l border-gray-100 ${
                    isToday(day) ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className="text-xs text-gray-400 font-medium">{DAYS_PT[day.getDay()]}</p>
                  <p
                    className={`text-base font-semibold mt-0.5 w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                      isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-800'
                    }`}
                  >
                    {format(day, 'd')}
                  </p>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="grid grid-cols-8">
              {/* Hour labels */}
              <div>
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="flex items-start justify-end pr-2 text-xs text-gray-400"
                    style={{ height: SLOT_HEIGHT }}
                  >
                    <span className="-mt-2">{h}:00</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => {
                const dayAppts = appointments.filter((a) =>
                  isSameDay(parseISO(a.scheduledAt), day),
                )
                return (
                  <div
                    key={day.toISOString()}
                    className={`relative border-l border-gray-100 ${
                      isToday(day) ? 'bg-blue-50/30' : ''
                    }`}
                    style={{ height: SLOT_HEIGHT * HOURS.length }}
                  >
                    {/* Hour lines */}
                    {HOURS.map((h) => (
                      <div
                        key={h}
                        className="absolute left-0 right-0 border-t border-gray-100"
                        style={{ top: (h - 7) * SLOT_HEIGHT }}
                      />
                    ))}
                    {dayAppts.map((appt) => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        dayStart={day}
                        onClick={setSelectedAppointment}
                      />
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="px-4 py-2 border-t border-gray-100 bg-white flex flex-wrap gap-3">
        {(Object.entries(STATUS_LABELS) as [Appointment['status'], string][]).map(([s, label]) => (
          <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-3 h-3 rounded-full border ${STATUS_COLORS[s]}`} />
            {label}
          </span>
        ))}
      </div>

      <DetailModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
