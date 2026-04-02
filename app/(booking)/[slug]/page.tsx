'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  DollarSign,
  User,
  Phone,
  Mail,
  Loader2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek,
  getDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Service {
  id: string
  name: string
  duration: number
  price: number
  description: string | null
}

interface Professional {
  name: string
  businessName: string
  businessType: string
  address: string | null
  city: string | null
  state: string | null
}

interface TimeSlot {
  time: string // "HH:MM"
  available: boolean
}

type Step = 1 | 2 | 3 | 4 | 5

// ── Step indicator ─────────────────────────────────────────────────────────────

const STEP_LABELS = ['Serviço', 'Data', 'Horário', 'Dados', 'Confirmação']

function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const step = (i + 1) as Step
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  done
                    ? 'bg-blue-600 text-white'
                    : active
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : step}
              </div>
              <span
                className={`text-xs mt-1 whitespace-nowrap hidden sm:block ${
                  active ? 'text-blue-600 font-medium' : done ? 'text-gray-500' : 'text-gray-300'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`h-0.5 w-8 sm:w-12 mx-1 transition-colors ${
                  done ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1: Service selection ──────────────────────────────────────────────────

interface Step1Props {
  services: Service[]
  selectedService: Service | null
  onSelect: (s: Service) => void
  onNext: () => void
}

function Step1Services({ services, selectedService, onSelect, onNext }: Step1Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Escolha o serviço</h2>
        <p className="text-sm text-gray-500 mt-0.5">Selecione o serviço que deseja agendar</p>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service)}
            className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
              selectedService?.id === service.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{service.name}</p>
                {service.description && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{service.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration} min
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                    <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedService?.id === service.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedService?.id === service.id && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!selectedService}
        className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors mt-2"
      >
        Continuar
      </button>
    </div>
  )
}

// ── Step 2: Date selection calendar ───────────────────────────────────────────

interface Step2Props {
  selectedDate: Date | null
  onSelect: (d: Date) => void
  onNext: () => void
  onBack: () => void
  slug: string
  serviceId: string
}

const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function Step2Date({ selectedDate, onSelect, onNext, onBack, slug, serviceId }: Step2Props) {
  const [month, setMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set())
  const [loadingDates, setLoadingDates] = useState(true)

  useEffect(() => {
    async function load() {
      setLoadingDates(true)
      try {
        const startStr = format(startOfMonth(month), 'yyyy-MM-dd')
        const endStr = format(endOfMonth(month), 'yyyy-MM-dd')
        const res = await fetch(
          `/api/booking/${slug}/available-dates?serviceId=${serviceId}&start=${startStr}&end=${endStr}`,
        )
        if (res.ok) {
          const dates: string[] = await res.json()
          setAvailableDates(new Set(dates))
        }
      } finally {
        setLoadingDates(false)
      }
    }
    load()
  }, [month, slug, serviceId])

  const calendarStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Escolha a data</h2>
        <p className="text-sm text-gray-500 mt-0.5">Selecione um dia disponível</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-gray-900 capitalize">
            {format(month, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS_PT.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loadingDates ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const isCurrentMonth = day.getMonth() === month.getMonth()
              const isPast = isBefore(day, today)
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
              const dateStr = format(day, 'yyyy-MM-dd')
              const isAvailable = availableDates.has(dateStr)
              const isDisabled = isPast || !isCurrentMonth || !isAvailable

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => onSelect(day)}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow'
                      : isToday(day)
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : isDisabled
                      ? 'text-gray-200 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedDate}
          className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Time selection ─────────────────────────────────────────────────────

interface Step3Props {
  slug: string
  serviceId: string
  selectedDate: Date
  selectedTime: string | null
  onSelect: (t: string) => void
  onNext: () => void
  onBack: () => void
}

function Step3Time({ slug, serviceId, selectedDate, selectedTime, onSelect, onNext, onBack }: Step3Props) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const res = await fetch(
          `/api/booking/${slug}?serviceId=${serviceId}&date=${dateStr}`,
        )
        if (res.ok) {
          const data = await res.json()
          setSlots(data.slots ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, serviceId, selectedDate])

  const availableSlots = slots.filter((s) => s.available)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Escolha o horário</h2>
        <p className="text-sm text-gray-500 mt-0.5 capitalize">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">Nenhum horário disponível para este dia.</p>
          <p className="text-xs text-gray-400 mt-1">Tente outra data.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {availableSlots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              onClick={() => onSelect(slot.time)}
              className={`py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                selectedTime === slot.time
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-100 bg-white text-gray-700 hover:border-blue-200'
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedTime}
          className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}

// ── Step 4: Client info ────────────────────────────────────────────────────────

interface ClientInfo {
  name: string
  phone: string
  email: string
}

interface Step4Props {
  info: ClientInfo
  onChange: (info: ClientInfo) => void
  onNext: () => void
  onBack: () => void
  loading: boolean
}

function Step4ClientInfo({ info, onChange, onNext, onBack, loading }: Step4Props) {
  const [errors, setErrors] = useState<Partial<ClientInfo>>({})

  function validate(): boolean {
    const e: Partial<ClientInfo> = {}
    if (!info.name.trim()) e.name = 'Nome é obrigatório'
    if (!info.phone.trim() || info.phone.replace(/\D/g, '').length < 10)
      e.phone = 'Telefone inválido'
    if (info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email))
      e.email = 'E-mail inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Seus dados</h2>
        <p className="text-sm text-gray-500 mt-0.5">Para confirmar o agendamento</p>
      </div>

      <div className="space-y-4 bg-white rounded-2xl border border-gray-100 p-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Nome completo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Seu nome"
              value={info.name}
              onChange={(e) => onChange({ ...info, name: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.name ? 'border-red-400' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Telefone / WhatsApp <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="tel"
              placeholder="(11) 99999-9999"
              value={info.phone}
              onChange={(e) => onChange({ ...info, phone: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.phone ? 'border-red-400' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.phone}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            E-mail <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              placeholder="seu@email.com"
              value={info.email}
              onChange={(e) => onChange({ ...info, email: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.email ? 'border-red-400' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-semibold disabled:opacity-40 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Confirmar agendamento
        </button>
      </div>
    </div>
  )
}

// ── Step 5: Confirmation ───────────────────────────────────────────────────────

interface Step5Props {
  service: Service
  date: Date
  time: string
  clientInfo: ClientInfo
  professional: Professional
  onNewBooking: () => void
}

function Step5Confirmation({ service, date, time, clientInfo, professional, onNewBooking }: Step5Props) {
  return (
    <div className="text-center space-y-6">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Agendamento confirmado!</h2>
        <p className="text-sm text-gray-500 mt-1">
          {clientInfo.email
            ? `Confirmação enviada para ${clientInfo.email}`
            : 'Anote os detalhes abaixo para não esquecer.'}
        </p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Cliente</p>
            <p className="text-sm font-semibold text-gray-900">{clientInfo.name}</p>
            <p className="text-xs text-gray-500">{clientInfo.phone}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Data e horário</p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-xs text-gray-500">às {time}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Serviço</p>
            <p className="text-sm font-semibold text-gray-900">{service.name}</p>
            <p className="text-xs text-gray-500">
              {service.duration} min — {formatCurrency(service.price)}
            </p>
          </div>
        </div>

        {(professional.address || professional.city) && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xs">📍</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Local</p>
              <p className="text-sm font-semibold text-gray-900">{professional.businessName}</p>
              {professional.address && (
                <p className="text-xs text-gray-500">
                  {professional.address}
                  {professional.city && `, ${professional.city}`}
                  {professional.state && ` – ${professional.state}`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onNewBooking}
        className="w-full py-3.5 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
      >
        Fazer novo agendamento
      </button>
    </div>
  )
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-24 bg-gray-200 rounded-2xl" />
      <div className="h-8 bg-gray-200 rounded-xl w-2/3" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const params = useParams()
  const slug = params.slug as string

  const [step, setStep] = useState<Step>(1)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientInfo, setClientInfo] = useState<ClientInfo>({ name: '', phone: '', email: '' })

  const loadPage = useCallback(async () => {
    setPageLoading(true)
    setPageError(null)
    try {
      const res = await fetch(`/api/booking/${slug}`)
      if (res.status === 404) {
        setPageError('Profissional não encontrado.')
        return
      }
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProfessional(data.professional)
      setServices(data.services)
    } catch {
      setPageError('Erro ao carregar página. Tente novamente.')
    } finally {
      setPageLoading(false)
    }
  }, [slug])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  function resetBooking() {
    setStep(1)
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setClientInfo({ name: '', phone: '', email: '' })
  }

  async function handleConfirm() {
    if (!selectedService || !selectedDate || !selectedTime) return
    setBookingLoading(true)
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(hours, minutes, 0, 0)

      const res = await fetch(`/api/booking/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          scheduledAt: scheduledAt.toISOString(),
          customer: clientInfo,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao confirmar')
      }
      setStep(5)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao confirmar agendamento. Tente novamente.')
    } finally {
      setBookingLoading(false)
    }
  }

  const BUSINESS_TYPE_LABELS: Record<string, string> = {
    salao: 'Salão de Beleza',
    barbearia: 'Barbearia',
    clinica: 'Clínica Estética',
    dentista: 'Dentista',
    psicologo: 'Psicólogo(a)',
    fisioterapeuta: 'Fisioterapeuta',
    nutricionista: 'Nutricionista',
    personal: 'Personal Trainer',
    manicure: 'Manicure/Pedicure',
    outros: 'Profissional',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-16">
        {pageLoading ? (
          <PageSkeleton />
        ) : pageError ? (
          <div className="text-center py-24">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-lg font-semibold text-gray-900">{pageError}</h2>
            <button
              type="button"
              onClick={loadPage}
              className="mt-4 text-blue-600 text-sm underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : professional ? (
          <div className="space-y-6">
            {/* Professional header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600">
                  {professional.businessName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {professional.businessName}
                </h1>
                <p className="text-sm text-gray-500">
                  {BUSINESS_TYPE_LABELS[professional.businessType] ?? professional.businessType}
                </p>
                {(professional.city || professional.state) && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    📍 {[professional.city, professional.state].filter(Boolean).join(' – ')}
                  </p>
                )}
              </div>
            </div>

            {/* Step indicator */}
            {step < 5 && (
              <div className="flex justify-center">
                <StepIndicator current={step} />
              </div>
            )}

            {/* Step content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              {step === 1 && (
                <Step1Services
                  services={services}
                  selectedService={selectedService}
                  onSelect={setSelectedService}
                  onNext={() => setStep(2)}
                />
              )}

              {step === 2 && selectedService && (
                <Step2Date
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                  slug={slug}
                  serviceId={selectedService.id}
                />
              )}

              {step === 3 && selectedService && selectedDate && (
                <Step3Time
                  slug={slug}
                  serviceId={selectedService.id}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSelect={setSelectedTime}
                  onNext={() => setStep(4)}
                  onBack={() => setStep(2)}
                />
              )}

              {step === 4 && (
                <Step4ClientInfo
                  info={clientInfo}
                  onChange={setClientInfo}
                  onNext={handleConfirm}
                  onBack={() => setStep(3)}
                  loading={bookingLoading}
                />
              )}

              {step === 5 && selectedService && selectedDate && selectedTime && (
                <Step5Confirmation
                  service={selectedService}
                  date={selectedDate}
                  time={selectedTime}
                  clientInfo={clientInfo}
                  professional={professional}
                  onNewBooking={resetBooking}
                />
              )}
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400">
              Agendamento online por{' '}
              <span className="font-semibold text-blue-500">AgendaFácil</span>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
