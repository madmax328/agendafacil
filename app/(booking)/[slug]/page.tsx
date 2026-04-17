'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2, MapPin, Phone, Clock, ChevronLeft, ChevronRight,
  X, User, Mail, Loader2, Check, Copy, QrCode, Scissors, ArrowRight, Star,
} from 'lucide-react'
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isBefore, isToday, isSameDay,
  startOfWeek, endOfWeek,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Service {
  id: string
  name: string
  duration: number
  price: number
  description: string | null
}

interface AvailabilitySlot {
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface Professional {
  name: string
  businessName: string
  businessType: string
  address: string | null
  addressNumber: string | null
  zipCode: string | null
  city: string | null
  state: string | null
  phone: string | null
  image: string | null
  bio: string | null
  isDemo: boolean
  pixKey: string | null
  plan: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  image: string | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  clientName: string
  createdAt: string
}

interface TimeSlot {
  time: string
  available: boolean
}

interface LoggedInClient {
  id: string
  name: string
  email: string
  phone: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const BUSINESS_TYPES: Record<string, string> = {
  salao: 'Salão de Beleza',
  barbearia: 'Barbearia',
  clinica: 'Clínica',
  estudio: 'Estúdio',
  spa: 'Spa',
  outros: 'Profissional',
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// ── Sub-components ─────────────────────────────────────────────────────────────

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

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ProfissionalPage() {
  const { slug } = useParams() as { slug: string }
  const { toast } = useToast()

  // ── Profile data ──
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  // ── Auth ──
  const [loggedInClient, setLoggedInClient] = useState<LoggedInClient | null>(null)

  // ── Booking modal ──
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [bookingStep, setBookingStep] = useState(1) // 1=date 2=time 3=info/summary 4=success

  // Step 1 – date
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [datesLoading, setDatesLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Step 2 – time
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  // Step 3 – client info
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '', email: '' })
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({})

  // Step 4 – success
  const [bookingLoading, setBookingLoading] = useState(false)
  const [confirmedAppt, setConfirmedAppt] = useState<{ scheduledAt: string } | null>(null)

  // ── Load profile + auth ──
  useEffect(() => {
    async function load() {
      try {
        const [proRes, meRes] = await Promise.all([
          fetch(`/api/booking/${slug}`),
          fetch('/api/cliente/me'),
        ])
        if (!proRes.ok) { setLoading(false); return }
        const data = await proRes.json()
        setProfessional(data.professional)
        setServices(data.services ?? [])
        setAvailability(data.availability ?? [])
        setTeamMembers(data.teamMembers ?? [])
        setReviews(data.reviews ?? [])
        if (meRes.ok) {
          const me = await meRes.json()
          setLoggedInClient(me)
          setClientInfo({ name: me.name ?? '', phone: me.phone ?? '', email: me.email ?? '' })
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  // ── Fetch available dates when month / service changes ──
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

  // ── Fetch time slots when date changes ──
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
    if (!loggedInClient) {
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
      const customer = loggedInClient
        ? { name: loggedInClient.name, phone: loggedInClient.phone, email: loggedInClient.email }
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

  // ── Calendar helpers ──
  const calStart  = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
  const calEnd    = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
  const calDays   = eachDayOfInterval({ start: calStart, end: calEnd })
  const todayDate = new Date()

  const amSlots = slots.filter(s => parseInt(s.time.split(':')[0]) < 12)
  const pmSlots = slots.filter(s => parseInt(s.time.split(':')[0]) >= 12)

  // ── Team scroll ──
  const teamScrollRef = useRef<HTMLDivElement>(null)
  function scrollTeam(dir: 'left' | 'right') {
    teamScrollRef.current?.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' })
  }

  // ── Rating average ──
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  // ── Progress bar labels ──
  const stepLabels = loggedInClient
    ? ['Data', 'Horário', 'Confirmar']
    : ['Data', 'Horário', 'Seus dados']

  // ── Loading / not found ──
  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )

  if (!professional) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-700">Profissional não encontrado</p>
        <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline text-sm">Voltar ao início</Link>
      </div>
    </div>
  )

  const typeLabel  = BUSINESS_TYPES[professional.businessType] ?? 'Profissional'
  const addrLine   = [professional.address, professional.addressNumber].filter(Boolean).join(', ')
  const fullAddr   = [addrLine || null, professional.zipCode, professional.city, professional.state].filter(Boolean).join(', ')
  const mapsUrl    = fullAddr ? `https://maps.google.com/?q=${encodeURIComponent(fullAddr)}` : null

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Sticky header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-1.5 group shrink-0">
            <div className="bg-blue-600 rounded-lg p-1 group-hover:bg-blue-700 transition-colors">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-gray-900 text-base">Markou</span>
          </Link>

          <span className="text-sm font-semibold text-gray-700 truncate hidden sm:block">
            {professional.businessName}
          </span>

          {loggedInClient ? (
            <Link href="/cliente/reservas"
              className="shrink-0 text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Minhas reservas
            </Link>
          ) : (
            <Link href="/cliente/login"
              className="shrink-0 text-sm font-semibold px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors">
              Entrar
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div className="w-full overflow-hidden border-b border-gray-200" style={{ height: '300px' }}>
        <div className="max-w-5xl mx-auto h-full flex">
          {/* Left: large photo */}
          <div className="flex-1 overflow-hidden bg-gray-900">
            {professional.image
              ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={professional.image} alt={professional.businessName} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <Scissors className="h-24 w-24 text-gray-700" />
                </div>
            }
          </div>
          {/* Right: name card */}
          <div className="w-64 sm:w-80 shrink-0 flex items-center justify-center bg-white border-l border-gray-200 px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase leading-tight tracking-tight text-center">
              {professional.businessName}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Profile row ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            {/* Logo box + info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-20 h-20 shrink-0 border-2 border-gray-400 flex items-center justify-center overflow-hidden bg-white">
                {professional.image
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={professional.image} alt="" className="w-full h-full object-cover" />
                  : <span className="text-[10px] font-black text-gray-900 text-center px-1 uppercase leading-tight">
                      {professional.businessName}
                    </span>
                }
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-gray-900 uppercase leading-tight truncate">{professional.businessName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{typeLabel}</p>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-sm font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({reviews.length} avaliações)</span>
                  </div>
                )}
              </div>
            </div>
            {/* Map embed */}
            {fullAddr && (
              <div className="hidden sm:block w-64 shrink-0 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddr)}&output=embed&z=15`}
                  width="100%" height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização"
                />
              </div>
            )}
          </div>
        </div>

        {/* Demo warning */}
        {professional.isDemo && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5 text-sm text-amber-800 text-center font-medium">
            Perfil de demonstração — agendamentos não disponíveis
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* ── Left: services ── */}
          <div className="space-y-10">

            {/* Horizontal "quick book" cards */}
            {services.length > 0 && (
              <section>
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">Mais agendados</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                  {services.map(svc => (
                    <div key={svc.id}
                      className="snap-start shrink-0 w-44 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                      <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{svc.name}</p>
                      <p className="text-xs text-gray-500">{svc.duration} min</p>
                      <div className="text-xs text-gray-500">
                        A partir de:<br />
                        <span className="text-base font-extrabold text-gray-900">{formatCurrency(svc.price)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openBooking(svc)}
                        disabled={professional.isDemo}
                        className="mt-auto w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Agendar
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Full service list */}
            {services.length > 0 && (
              <section>
                <h2 className="text-lg font-extrabold text-gray-900 mb-3">Todos os serviços</h2>
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {services.map(svc => (
                    <div key={svc.id}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{svc.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{svc.duration} min · {formatCurrency(svc.price)}</p>
                        {svc.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{svc.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => openBooking(svc)}
                        disabled={professional.isDemo}
                        className="shrink-0 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        Agendar
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {services.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <Scissors className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">Nenhum serviço disponível no momento</p>
              </div>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <aside className="space-y-4 lg:mt-0">

            {fullAddr && (
              <div className="sm:hidden bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700 leading-snug">{fullAddr}</p>
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-gray-500 hover:underline mt-1 inline-block">
                        Ver no mapa
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {availability.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900">Horários</h3>
                </div>
                <div className="space-y-1.5">
                  {availability.map(a => (
                    <div key={a.dayOfWeek} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 w-10 shrink-0">{DAY_NAMES[a.dayOfWeek]}</span>
                      <span className="text-gray-800 font-medium text-xs">{a.startTime} às {a.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {professional.phone && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={`tel:${professional.phone}`}
                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors font-medium">
                    {professional.phone}
                  </a>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ── Nossa equipe ── */}
      {teamMembers.length > 0 && (
        <div className="max-w-5xl mx-auto w-full px-4 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-gray-900">Nossa equipe</h2>
            <div className="flex gap-1">
              <button type="button" onClick={() => scrollTeam('left')}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => scrollTeam('right')}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div ref={teamScrollRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
            {teamMembers.map(member => (
              <div key={member.id}
                className="snap-start shrink-0 w-44 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm text-center">
                {member.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.image} alt={member.name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-blue-50 flex items-center justify-center">
                    <span className="text-4xl font-extrabold text-blue-600">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="p-3">
                  <p className="font-bold text-gray-900 text-sm leading-snug">{member.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Avaliações dos clientes ── */}
      {reviews.length > 0 && (
        <div className="max-w-5xl mx-auto w-full px-4 pb-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-5">Avaliações dos nossos clientes</h2>

          {/* Aggregate */}
          <div className="flex items-end gap-4 mb-6">
            <span className="text-5xl font-extrabold text-gray-900 leading-none">{avgRating.toFixed(1)}</span>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`h-5 w-5 ${n <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-500">{reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}</p>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-100">
            {reviews.map(review => (
              <div key={review.id} className="py-4 first:pt-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-800">{review.rating.toFixed(1)}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 mb-1.5 leading-relaxed">{review.comment}</p>
                )}
                <p className="text-xs text-gray-400">
                  {review.clientName}, em {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sobre o negócio ── */}
      {professional.bio && (
        <div className="max-w-5xl mx-auto w-full px-4 pb-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-3">Sobre</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{professional.bio}</p>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-500 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
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

      {/* ════════════════ BOOKING MODAL ════════════════ */}
      {bookingOpen && selectedService && (
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

            {/* Progress bar (steps 1-3) */}
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

              {/* ── Step 1: Date ── */}
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
                              selected ? 'bg-blue-600 text-white shadow-md' : '',
                              !selected && available && !isPast ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : '',
                              !selected && (!available || isPast) && inMonth ? 'text-gray-300 cursor-not-allowed' : '',
                              isToday(day) && !selected ? 'ring-2 ring-blue-600 ring-offset-1' : '',
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

              {/* ── Step 2: Time ── */}
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
                                  !slot.available ? 'bg-gray-100 text-gray-300 line-through cursor-not-allowed text-xs' :
                                  selectedTime === slot.time ? 'bg-blue-600 text-white shadow-md' :
                                  'bg-blue-50 text-blue-700 hover:bg-blue-100',
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
                                  !slot.available ? 'bg-gray-100 text-gray-300 line-through cursor-not-allowed text-xs' :
                                  selectedTime === slot.time ? 'bg-blue-600 text-white shadow-md' :
                                  'bg-blue-50 text-blue-700 hover:bg-blue-100',
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

              {/* ── Step 3: Client info (not logged in) ── */}
              {bookingStep === 3 && !loggedInClient && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Preencha seus dados para confirmar o agendamento</p>

                  {/* Name */}
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

                  {/* Phone */}
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

                  {/* Email */}
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

              {/* ── Step 3: Summary (logged in) ── */}
              {bookingStep === 3 && loggedInClient && (
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
                    <InfoRow label="Nome" value={loggedInClient.name} />
                  </div>
                </div>
              )}

              {/* ── Step 4: Success ── */}
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
                    {fullAddr && <InfoRow label="Local" value={professional.businessName} />}
                  </div>

                  {professional.plan === 'PRO' && professional.pixKey && (
                    <PixBlock pixKey={professional.pixKey} />
                  )}

                  <div className="space-y-2">
                    {loggedInClient ? (
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

            {/* ── Modal footer: navigation ── */}
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
      )}
    </div>
  )
}
