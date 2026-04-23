'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  X, ChevronLeft, ChevronRight, Loader2, User, Phone, Mail,
  Check, Copy, QrCode, CheckCircle2, ArrowRight,
} from 'lucide-react'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isBefore, isToday, isSameDay,
  startOfWeek, endOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface Service {
  id: string
  name: string
  duration: number
  price: number
  description: string | null
}

interface InitialClient {
  id: string
  name: string
  email: string
  phone: string
}

interface Props {
  services: Service[]
  slug: string
  initialClient: InitialClient | null
  isDemo: boolean
  plan: string
  pixKey: string | null
  businessName: string
  fullAddr: string
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function InfoRow({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-gray-400 w-16 shrink-0">{label}</span>
      <span className={`text-sm text-gray-800 font-medium ${className}`}>{value}</span>
    </div>
  )
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
    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-800 mb-1.5">
        <QrCode className="h-3.5 w-3.5" /> Pague via Pix
      </div>
      <div className="flex items-center gap-2">
        <p className="flex-1 text-xs font-mono text-green-900 break-all">{pixKey}</p>
        <button type="button" onClick={copy}
          className="shrink-0 p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 transition-colors">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}

export function BookingModal({
  services,
  slug,
  initialClient,
  isDemo,
  plan,
  pixKey,
  businessName,
  fullAddr,
}: Props) {
  const { toast } = useToast()

  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [bookingStep, setBookingStep] = useState(1)

  // Step 1 – date
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [datesLoading, setDatesLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Step 2 – time
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Step 3 – client info
  const [clientInfo, setClientInfo] = useState({
    name: initialClient?.name ?? '',
    phone: initialClient?.phone ?? '',
    email: initialClient?.email ?? '',
  })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})

  // Step 4 – success
  const [bookingLoading, setBookingLoading] = useState(false)
  const [confirmedAppt, setConfirmedAppt] = useState<{ scheduledAt: string } | null>(null)

  // Listen for open-booking events dispatched by <BookButton>
  useEffect(() => {
    function handler(e: Event) {
      const serviceId = (e as CustomEvent<string>).detail
      const service = services.find(s => s.id === serviceId)
      if (service) openBooking(service)
    }
    window.addEventListener('open-booking', handler)
    return () => window.removeEventListener('open-booking', handler)
  }, [services]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch available dates when month / service changes
  useEffect(() => {
    if (!bookingOpen || !selectedService) return
    setAvailableDates([])
    setDatesLoading(true)
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
    const end   = format(endOfMonth(currentMonth),   'yyyy-MM-dd')
    fetch(`/api/booking/${slug}/available-dates?serviceId=${selectedService.id}&start=${start}&end=${end}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setAvailableDates(Array.isArray(d) ? d : []))
      .catch(() => setAvailableDates([]))
      .finally(() => setDatesLoading(false))
  }, [bookingOpen, selectedService, currentMonth, slug])

  // Fetch time slots when date changes
  useEffect(() => {
    if (!selectedDate || !selectedService) return
    setSlotsLoading(true)
    setSlots([])
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    fetch(`/api/booking/${slug}?serviceId=${selectedService.id}&date=${dateStr}`)
      .then(r => r.ok ? r.json() : { slots: [] })
      .then(d => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [selectedDate, selectedService, slug])

  function openBooking(service: Service) {
    setSelectedService(service)
    setSelectedDate(null)
    setSelectedTime(null)
    setBookingStep(1)
    setConfirmedAppt(null)
    setClientErrors({})
    setCurrentMonth(new Date())
    setBookingOpen(true)
  }

  function goBack() {
    if (bookingStep === 2) { setSelectedTime(null); setBookingStep(1) }
    else if (bookingStep === 3) setBookingStep(2)
  }

  async function submitBooking() {
    if (!initialClient) {
      const errs: Record<string, string> = {}
      if (!clientInfo.name.trim()) errs.name = 'Nome é obrigatório'
      if (clientInfo.phone.replace(/\D/g, '').length < 10) errs.phone = 'Telefone inválido'
      if (clientInfo.email && !/\S+@\S+\.\S+/.test(clientInfo.email)) errs.email = 'E-mail inválido'
      if (Object.keys(errs).length) { setClientErrors(errs); return }
    }
    if (!selectedDate || !selectedTime || !selectedService) return
    setBookingLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const scheduledAtStr = `${dateStr}T${selectedTime}:00.000Z`
      const customer = initialClient
        ? { name: initialClient.name, phone: initialClient.phone, email: initialClient.email }
        : { name: clientInfo.name.trim(), phone: clientInfo.phone.replace(/\D/g, ''), email: clientInfo.email.trim() }
      const res = await fetch(`/api/booking/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: selectedService.id, scheduledAt: scheduledAtStr, customer }),
      })
      const data = await res.json()
      if (!res.ok) { toast({ title: data.error || 'Erro ao agendar', variant: 'destructive' }); return }
      setConfirmedAppt(data)
      setBookingStep(4)
    } catch {
      toast({ title: 'Erro ao agendar. Tente novamente.', variant: 'destructive' })
    } finally {
      setBookingLoading(false)
    }
  }

  // Calendar helpers
  const calStart  = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
  const calEnd    = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
  const calDays   = eachDayOfInterval({ start: calStart, end: calEnd })
  const todayDate = new Date()

  const amSlots = slots.filter(s => parseInt(s.time.split(':')[0]) < 12)
  const pmSlots = slots.filter(s => parseInt(s.time.split(':')[0]) >= 12)

  const stepLabels = initialClient
    ? ['Data', 'Horário', 'Confirmar']
    : ['Data', 'Horário', 'Seus dados']

  if (!bookingOpen || !selectedService) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBookingOpen(false)} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{selectedService.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {selectedService.duration} min · {formatCurrency(selectedService.price)}
            </p>
          </div>
          <button type="button" onClick={() => setBookingOpen(false)}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors ml-2 shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        {bookingStep < 4 && (
          <div className="px-5 pt-3 pb-0">
            <div className="flex gap-1">
              {stepLabels.map((_, i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                  i + 1 <= bookingStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1 font-medium">{stepLabels[bookingStep - 1]}</p>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Step 1: Date */}
          {bookingStep === 1 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                  className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <span className="text-sm font-bold text-gray-900 capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </span>
                <button type="button" onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                  className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-7 mb-1">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>
              {datesLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-0.5">
                  {calDays.map(day => {
                    const dateStr   = format(day, 'yyyy-MM-dd')
                    const inMonth   = day.getMonth() === currentMonth.getMonth()
                    const isPast    = isBefore(day, todayDate) && !isToday(day)
                    const available = availableDates.includes(dateStr)
                    const selected  = selectedDate ? isSameDay(day, selectedDate) : false
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={!inMonth || isPast || !available}
                        onClick={() => setSelectedDate(day)}
                        className={[
                          'aspect-square w-full rounded-xl text-xs font-semibold transition-all',
                          !inMonth ? 'invisible' : '',
                          selected ? '!bg-blue-600 !text-white shadow-md' : '',
                          !selected && available && !isPast ? '!bg-blue-50 !text-blue-700 hover:!bg-blue-100' : '',
                          !selected && (!available || isPast) && inMonth ? '!text-gray-300 !bg-transparent cursor-not-allowed' : '',
                          isToday(day) && !selected ? 'ring-2 !ring-blue-600 ring-offset-1' : '',
                        ].join(' ')}
                      >
                        {format(day, 'd')}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Time */}
          {bookingStep === 2 && (
            <div>
              <p className="text-sm font-bold text-gray-900 mb-4 capitalize">
                {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
              {slotsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">Nenhum horário disponível</div>
              ) : (
                <div className="space-y-5">
                  {amSlots.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Manhã</p>
                      <div className="grid grid-cols-4 gap-2">
                        {amSlots.map(slot => (
                          <button key={slot.time} type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={[
                              'py-2.5 rounded-xl text-sm font-semibold transition-all',
                              !slot.available ? '!bg-gray-100 !text-gray-300 line-through cursor-not-allowed text-xs' :
                              selectedTime === slot.time ? '!bg-blue-600 !text-white shadow-md' :
                              '!bg-blue-50 !text-blue-700 hover:!bg-blue-100',
                            ].join(' ')}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {pmSlots.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tarde / Noite</p>
                      <div className="grid grid-cols-4 gap-2">
                        {pmSlots.map(slot => (
                          <button key={slot.time} type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className={[
                              'py-2.5 rounded-xl text-sm font-semibold transition-all',
                              !slot.available ? '!bg-gray-100 !text-gray-300 line-through cursor-not-allowed text-xs' :
                              selectedTime === slot.time ? '!bg-blue-600 !text-white shadow-md' :
                              '!bg-blue-50 !text-blue-700 hover:!bg-blue-100',
                            ].join(' ')}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Client info (not logged in) */}
          {bookingStep === 3 && !initialClient && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Preencha seus dados para confirmar o agendamento</p>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Nome *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={clientInfo.name}
                    onChange={e => setClientInfo(p => ({ ...p, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      clientErrors.name ? 'border-red-400' : 'border-gray-200'}`} />
                </div>
                {clientErrors.name && <p className="text-xs text-red-500 mt-1">{clientErrors.name}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Telefone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="tel" value={clientInfo.phone}
                    onChange={e => setClientInfo(p => ({ ...p, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      clientErrors.phone ? 'border-red-400' : 'border-gray-200'}`} />
                </div>
                {clientErrors.phone && <p className="text-xs text-red-500 mt-1">{clientErrors.phone}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">E-mail (opcional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="email" value={clientInfo.email}
                    onChange={e => setClientInfo(p => ({ ...p, email: e.target.value }))}
                    placeholder="seu@email.com"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      clientErrors.email ? 'border-red-400' : 'border-gray-200'}`} />
                </div>
                {clientErrors.email && <p className="text-xs text-red-500 mt-1">{clientErrors.email}</p>}
              </div>
            </div>
          )}

          {/* Step 3: Summary (logged in) */}
          {bookingStep === 3 && initialClient && (
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3">Confirmar agendamento</p>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2.5">
                <InfoRow label="Serviço" value={selectedService.name} />
                <InfoRow label="Duração" value={`${selectedService.duration} min`} />
                <InfoRow label="Preço" value={formatCurrency(selectedService.price)} />
                {selectedDate && (
                  <InfoRow
                    label="Data"
                    value={format(selectedDate, "EEE, dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                    className="capitalize"
                  />
                )}
                {selectedTime && <InfoRow label="Horário" value={selectedTime} />}
                <InfoRow label="Nome" value={initialClient.name} />
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {bookingStep === 4 && (
            <div className="text-center py-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">Agendado com sucesso!</h3>
              <p className="text-sm text-gray-500 mb-5 capitalize">
                {selectedDate && format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                {selectedTime && ` às ${selectedTime}`}
              </p>
              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2.5 mb-4">
                <InfoRow label="Serviço" value={selectedService.name} />
                <InfoRow label="Duração" value={`${selectedService.duration} min`} />
                <InfoRow label="Preço" value={formatCurrency(selectedService.price)} />
                {fullAddr && <InfoRow label="Local" value={businessName} />}
              </div>
              {plan === 'PRO' && pixKey && <PixBlock pixKey={pixKey} />}
              <div className="space-y-2">
                {initialClient ? (
                  <Link href="/cliente/reservas"
                    className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    Ver minhas reservas <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link href="/cliente/cadastro"
                    className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    Criar conta para gerenciar reservas <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
                <button type="button"
                  onClick={() => { setBookingStep(1); setSelectedDate(null); setSelectedTime(null); setConfirmedAppt(null) }}
                  className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors">
                  Fazer novo agendamento
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal footer: navigation */}
        {bookingStep < 4 && (
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
            {bookingStep > 1 && (
              <button type="button" onClick={goBack}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
            )}
            <button
              type="button"
              disabled={bookingLoading}
              onClick={() => {
                if (bookingStep === 1) {
                  if (!selectedDate) { toast({ title: 'Selecione uma data', variant: 'destructive' }); return }
                  setBookingStep(2)
                } else if (bookingStep === 2) {
                  if (!selectedTime) { toast({ title: 'Selecione um horário', variant: 'destructive' }); return }
                  setBookingStep(3)
                } else if (bookingStep === 3) {
                  submitBooking()
                }
              }}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-1"
            >
              {bookingLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : bookingStep === 3 ? (
                'Confirmar'
              ) : (
                <>Continuar <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
