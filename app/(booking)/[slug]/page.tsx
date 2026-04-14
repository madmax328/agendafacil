'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, Check, Clock, User, Phone, Mail,
  Loader2, AlertCircle, CheckCircle2, MapPin, Scissors, ArrowLeft,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isBefore, isToday, isSameDay,
  startOfWeek, endOfWeek,
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
  isDemo: boolean
}

interface LoggedInClient {
  id: string
  name: string
  email: string
  phone: string
}

interface TimeSlot {
  time: string
  available: boolean
}

interface ClientInfo {
  name: string
  phone: string
  email: string
}

type Step = 1 | 2 | 3 | 4 | 5

// ── Progress bar ───────────────────────────────────────────────────────────────

const STEPS = ['Serviço', 'Data', 'Horário', 'Dados']

function Progress({ current, skipStep4 }: { current: Step; skipStep4: boolean }) {
  const total = skipStep4 ? 3 : 4
  const active = current === 5 ? total : Math.min(current, total)
  const pct = ((active - 1) / (total - 1)) * 100

  return (
    <div className="px-6 py-4 bg-white border-b border-gray-100">
      <div className="flex justify-between mb-2">
        {(skipStep4 ? STEPS.slice(0, 3) : STEPS).map((label, i) => {
          const idx = i + 1
          const done = idx < active || current === 5
          const act = idx === active && current < 5
          return (
            <span
              key={label}
              className={`text-xs font-semibold ${done || act ? 'text-blue-600' : 'text-gray-300'}`}
            >
              {label}
            </span>
          )
        })}
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: current === 5 ? '100%' : `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Step 1: Service ────────────────────────────────────────────────────────────

function Step1Services({
  services, selectedService, onSelect, onNext,
}: {
  services: Service[]
  selectedService: Service | null
  onSelect: (s: Service) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Serviços disponíveis</p>
        {services.map((svc) => {
          const sel = selectedService?.id === svc.id
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() => onSelect(svc)}
              className={`w-full text-left rounded-2xl border-2 transition-all p-4 group ${
                sel ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${sel ? 'bg-blue-500' : 'bg-gray-100'}`}>
                    <Scissors className={`h-4 w-4 ${sel ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm truncate ${sel ? 'text-blue-700' : 'text-gray-800'}`}>{svc.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{svc.duration} min
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${sel ? 'text-blue-600' : 'text-gray-700'}`}>
                    {formatCurrency(svc.price)}
                  </p>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ml-auto mt-1 ${sel ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                    {sel && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>
              </div>
              {svc.description && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-1 pl-13">{svc.description}</p>
              )}
            </button>
          )
        })}
      </div>
      <div className="p-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedService}
          className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm disabled:opacity-30 hover:bg-blue-700 transition-colors"
        >
          Continuar com {selectedService ? selectedService.name : '—'}
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Date ───────────────────────────────────────────────────────────────

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function Step2Date({
  selectedDate, onSelect, onNext, onBack, slug, serviceId,
}: {
  selectedDate: Date | null
  onSelect: (d: Date) => void
  onNext: () => void
  onBack: () => void
  slug: string
  serviceId: string
}) {
  const [month, setMonth] = useState(new Date())
  const [available, setAvailable] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const s = format(startOfMonth(month), 'yyyy-MM-dd')
        const e = format(endOfMonth(month), 'yyyy-MM-dd')
        const res = await fetch(`/api/booking/${slug}/available-dates?serviceId=${serviceId}&start=${s}&end=${e}`)
        if (res.ok) setAvailable(new Set(await res.json()))
      } finally { setLoading(false) }
    }
    load()
  }, [month, slug, serviceId])

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const calStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  const calEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Escolha a data</p>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMonth(m => subMonths(m, 1))} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-gray-800 capitalize">
            {format(month, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={() => setMonth(m => addMonths(m, 1))} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {days.map(day => {
              const inMonth = day.getMonth() === month.getMonth()
              const past = isBefore(day, today)
              const sel = selectedDate ? isSameDay(day, selectedDate) : false
              const avail = available.has(format(day, 'yyyy-MM-dd'))
              const disabled = past || !inMonth || !avail

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(day)}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                    sel
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : isToday(day) && !disabled
                      ? 'ring-2 ring-blue-400 text-blue-600'
                      : disabled
                      ? 'text-gray-200 cursor-not-allowed'
                      : avail
                      ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      : 'text-gray-200'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        )}

        {selectedDate && (
          <p className="text-center text-sm text-blue-600 font-semibold mt-4 capitalize">
            {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        )}
      </div>

      <div className="p-6 border-t border-gray-100 flex gap-3">
        <button onClick={onBack} className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
          Voltar
        </button>
        <button onClick={onNext} disabled={!selectedDate} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm disabled:opacity-30 hover:bg-blue-700 transition-colors">
          Continuar
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Time ───────────────────────────────────────────────────────────────

function Step3Time({
  slug, serviceId, selectedDate, selectedTime, onSelect, onNext, onBack, confirmLabel, confirmLoading,
}: {
  slug: string
  serviceId: string
  selectedDate: Date
  selectedTime: string | null
  onSelect: (t: string) => void
  onNext: () => void
  onBack: () => void
  confirmLabel?: string
  confirmLoading?: boolean
}) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const res = await fetch(`/api/booking/${slug}?serviceId=${serviceId}&date=${dateStr}`, { cache: 'no-store' })
        if (res.ok) { const d = await res.json(); setSlots(d.slots ?? []) }
      } finally { setLoading(false) }
    }
    load()
  }, [slug, serviceId, selectedDate])

  const am = slots.filter(s => parseInt(s.time) < 12)
  const pm = slots.filter(s => parseInt(s.time) >= 12)

  function SlotGrid({ list }: { list: TimeSlot[] }) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {list.map(slot => {
          const sel = selectedTime === slot.time
          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => onSelect(slot.time)}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${
                !slot.available
                  ? 'bg-gray-50 text-gray-300 line-through cursor-not-allowed'
                  : sel
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {slot.time}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
        </p>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-blue-400" /></div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm">Nenhum horário disponível.<br />Tente outra data.</p>
          </div>
        ) : (
          <>
            {am.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 mb-2">Manhã</p>
                <SlotGrid list={am} />
              </div>
            )}
            {pm.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 mb-2">Tarde / Noite</p>
                <SlotGrid list={pm} />
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-6 border-t border-gray-100 flex gap-3">
        <button onClick={onBack} disabled={confirmLoading} className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!selectedTime || !!confirmLoading}
          className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm disabled:opacity-30 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {confirmLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel ?? 'Continuar'}
        </button>
      </div>
    </div>
  )
}

// ── Step 4: Client info ────────────────────────────────────────────────────────

function Step4ClientInfo({
  info, onChange, onNext, onBack, loading,
}: {
  info: ClientInfo
  onChange: (i: ClientInfo) => void
  onNext: () => void
  onBack: () => void
  loading: boolean
}) {
  const [errors, setErrors] = useState<Partial<ClientInfo>>({})

  function validate() {
    const e: Partial<ClientInfo> = {}
    if (!info.name.trim()) e.name = 'Obrigatório'
    if (info.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone inválido'
    if (info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) e.email = 'E-mail inválido'
    setErrors(e)
    return !Object.keys(e).length
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Seus dados</p>

        {[
          { key: 'name', label: 'Nome completo', icon: User, type: 'text', placeholder: 'Seu nome', required: true },
          { key: 'phone', label: 'Telefone / WhatsApp', icon: Phone, type: 'tel', placeholder: '(11) 99999-9999', required: true },
          { key: 'email', label: 'E-mail (opcional)', icon: Mail, type: 'email', placeholder: 'seu@email.com', required: false },
        ].map(({ key, label, icon: Icon, type, placeholder, required }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type={type}
                placeholder={placeholder}
                value={info[key as keyof ClientInfo]}
                onChange={e => onChange({ ...info, [key]: e.target.value })}
                className={`w-full pl-10 pr-4 py-3.5 rounded-xl border-2 text-sm text-gray-900 focus:outline-none focus:border-blue-400 transition-colors ${
                  errors[key as keyof ClientInfo] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              />
            </div>
            {errors[key as keyof ClientInfo] && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />{errors[key as keyof ClientInfo]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-gray-100 flex gap-3">
        <button onClick={onBack} disabled={loading} className="flex-1 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors">
          Voltar
        </button>
        <button
          onClick={() => { if (validate()) onNext() }}
          disabled={loading}
          className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Confirmar
        </button>
      </div>
    </div>
  )
}

// ── Step 5: Confirmation ───────────────────────────────────────────────────────

function Step5Confirmation({
  service, date, time, clientInfo, professional, onNewBooking, isClientLoggedIn,
}: {
  service: Service
  date: Date
  time: string
  clientInfo: ClientInfo
  professional: Professional
  onNewBooking: () => void
  isClientLoggedIn?: boolean
}) {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">Agendamento confirmado!</h2>
        <p className="text-sm text-gray-500 mt-1">Aguardando confirmação do profissional.</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
        {[
          { icon: '🗓️', label: 'Data', value: format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }) },
          { icon: '🕐', label: 'Horário', value: `às ${time}` },
          { icon: '✂️', label: 'Serviço', value: `${service.name} · ${service.duration}min · ${formatCurrency(service.price)}` },
          { icon: '📍', label: 'Local', value: professional.businessName + (professional.city ? ` · ${professional.city}` : '') },
          { icon: '👤', label: 'Nome', value: clientInfo.name },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">{icon}</span>
            <div>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {isClientLoggedIn ? (
        <a href="/cliente" className="block w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm text-center hover:bg-blue-700 transition-colors">
          Ver minhas reservas
        </a>
      ) : (
        <a href="/cliente/cadastro" className="block w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm text-center hover:bg-blue-700 transition-colors">
          Criar conta para gerenciar reservas
        </a>
      )}
      <button onClick={onNewBooking} className="w-full py-3.5 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
        Fazer novo agendamento
      </button>
    </div>
  )
}

// ── Type labels ────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  salao: 'Salão de Beleza', barbearia: 'Barbearia', clinica: 'Clínica',
  dentista: 'Dentista', psicologo: 'Psicólogo(a)', fisioterapeuta: 'Fisioterapeuta',
  nutricionista: 'Nutricionista', personal: 'Personal Trainer', manicure: 'Manicure',
  outros: 'Profissional',
}

const TYPE_EMOJI: Record<string, string> = {
  salao: '💇', barbearia: '✂️', clinica: '🏥', dentista: '🦷',
  psicologo: '🧠', fisioterapeuta: '🦴', nutricionista: '🥗',
  personal: '💪', manicure: '💅', outros: '📋',
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      <div className="h-28 bg-gray-200 rounded-2xl" />
      <div className="h-4 bg-gray-200 rounded-full w-1/2" />
      {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const params = useParams()
  const slug = params.slug as string
  const { toast } = useToast()

  const [step, setStep] = useState<Step>(1)
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [loggedInClient, setLoggedInClient] = useState<LoggedInClient | null>(null)

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientInfo, setClientInfo] = useState<ClientInfo>({ name: '', phone: '', email: '' })

  const loadPage = useCallback(async () => {
    setPageLoading(true)
    setPageError(null)
    try {
      const [bookingRes, meRes] = await Promise.all([
        fetch(`/api/booking/${slug}`),
        fetch('/api/cliente/me'),
      ])
      if (bookingRes.status === 404) { setPageError('Profissional não encontrado.'); return }
      if (!bookingRes.ok) throw new Error()
      const data = await bookingRes.json()
      setProfessional(data.professional)
      setServices(data.services)
      if (meRes.ok) {
        const me: LoggedInClient = await meRes.json()
        setLoggedInClient(me)
        setClientInfo({ name: me.name, phone: me.phone, email: me.email })
      }
    } catch {
      setPageError('Erro ao carregar página. Tente novamente.')
    } finally {
      setPageLoading(false)
    }
  }, [slug])

  useEffect(() => { loadPage() }, [loadPage])

  function resetBooking() {
    setStep(1)
    setSelectedService(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setClientInfo(loggedInClient
      ? { name: loggedInClient.name, phone: loggedInClient.phone, email: loggedInClient.email }
      : { name: '', phone: '', email: '' }
    )
  }

  async function handleConfirm() {
    if (!selectedService || !selectedDate || !selectedTime) return
    setBookingLoading(true)
    try {
      const scheduledAtStr = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`
      const res = await fetch(`/api/booking/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selectedService.id, scheduledAt: scheduledAtStr, customer: clientInfo }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao confirmar')
      }
      setStep(5)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao confirmar agendamento'
      if (msg.includes('indisponível')) {
        toast({ title: 'Horário não disponível', description: 'Este horário foi reservado. Escolha outro.', variant: 'destructive' })
        setSelectedTime(null)
        setStep(3)
      } else {
        toast({ title: msg, variant: 'destructive' })
      }
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>Início</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <div className="bg-blue-600 rounded-lg p-1">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-gray-900 text-base">Markou</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {pageLoading ? (
          <Skeleton />
        ) : pageError ? (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-300 mb-4" />
            <p className="text-gray-700 font-semibold">{pageError}</p>
            <button onClick={loadPage} className="mt-4 text-sm text-blue-600 underline">Tentar novamente</button>
          </div>
        ) : professional ? (
          <div className="flex flex-col flex-1 bg-white shadow-sm">
            {/* Professional header */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 text-3xl">
                  {TYPE_EMOJI[professional.businessType] ?? '📋'}
                </div>
                <div className="min-w-0">
                  <h1 className="text-white font-extrabold text-base truncate leading-tight">
                    {professional.businessName}
                  </h1>
                  <p className="text-blue-200 text-xs mt-0.5">{TYPE_LABEL[professional.businessType] ?? 'Profissional'}</p>
                  {(professional.city || professional.address) && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-blue-300 shrink-0" />
                      <p className="text-blue-300 text-xs truncate">
                        {[professional.address, professional.city, professional.state].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Logged in banner */}
              {loggedInClient && step < 5 && (
                <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-green-300 shrink-0" />
                  <p className="text-xs text-white">
                    Agendando como <span className="font-bold">{loggedInClient.name}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Demo notice */}
            {professional.isDemo ? (
              <div className="flex items-start gap-3 m-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Perfil de demonstração</p>
                  <p className="text-xs text-amber-700 mt-0.5">Este é um perfil de exemplo. Agendamentos não estão disponíveis.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Progress */}
                {step < 5 && (
                  <Progress current={step} skipStep4={!!loggedInClient} />
                )}

                {/* Step content */}
                <div className="flex-1 flex flex-col overflow-hidden">
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
                      onNext={() => loggedInClient ? handleConfirm() : setStep(4)}
                      onBack={() => setStep(2)}
                      confirmLabel={loggedInClient ? 'Confirmar agendamento' : 'Continuar'}
                      confirmLoading={loggedInClient ? bookingLoading : false}
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
                      isClientLoggedIn={!!loggedInClient}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      <footer className="text-center py-4 text-xs text-gray-400">
        Agendamento por <span className="font-bold text-blue-500">Markou</span>
      </footer>
    </div>
  )
}
