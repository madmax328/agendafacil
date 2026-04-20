'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MapPin, Star, ChevronDown, ChevronUp, ChevronRight,
  Loader2, CalendarDays, Check,
} from 'lucide-react'

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface Professional {
  id: string
  slug: string
  name: string | null
  businessName: string
  businessType: string
  city: string | null
  state: string | null
  image: string | null
  isFeatured: boolean
  isDemo: boolean
  services: Service[]
  reviews: { rating: number }[]
}

interface SlotInfo {
  time: string
  available: boolean
}

interface ClientInfo {
  id: string
  name: string
  email: string
  phone: string
}

const TIPO_LABELS: Record<string, string> = {
  salao: 'Salão de Beleza',
  barbearia: 'Barbearia',
  clinica: 'Clínica',
  dentista: 'Dentista',
  psicologo: 'Psicólogo',
  estetica: 'Estética',
  massagem: 'Massagem',
  nutricionista: 'Nutricionista',
  fisioterapia: 'Fisioterapia',
  outros: 'Outro',
}

const TIPO_ICONS: Record<string, string> = {
  salao: '💇', barbearia: '✂️', clinica: '🏥', dentista: '🦷',
  psicologo: '🧠', estetica: '✨', massagem: '💆', nutricionista: '🥗',
  fisioterapia: '🦴', outros: '📋',
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  })
}

export function ProfissionaisClient({
  professionals,
  initialTipo,
  initialCidade,
  initialQ,
}: {
  professionals: Professional[]
  initialTipo?: string
  initialCidade?: string
  initialQ?: string
}) {
  const router = useRouter()
  const today = todayStr()

  const [selectedDate, setSelectedDate] = useState(today)
  const [maxPrice, setMaxPrice] = useState(210)
  const [expanded, setExpanded] = useState<{ proId: string; serviceId: string } | null>(null)
  const [slotsCache, setSlotsCache] = useState<Record<string, SlotInfo[]>>({})
  const [loadingSlots, setLoadingSlots] = useState<string | null>(null)
  const [loggedInClient, setLoggedInClient] = useState<ClientInfo | null>(null)
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [pendingBooking, setPendingBooking] = useState<{
    proSlug: string; proName: string; service: Service; slot: string
  } | null>(null)
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    fetch('/api/cliente/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLoggedInClient(data) })
      .catch(() => {})
      .finally(() => setCheckedAuth(true))
  }, [])

  const filtered = professionals.filter(pro => {
    if (maxPrice >= 210) return true
    return pro.services.some(s => s.price <= maxPrice)
  })

  function cacheKey(proId: string, serviceId: string, date: string) {
    return `${proId}__${serviceId}__${date}`
  }

  async function fetchSlots(pro: Professional, service: Service, date: string) {
    const key = cacheKey(pro.id, service.id, date)
    if (slotsCache[key] !== undefined) return
    setLoadingSlots(key)
    try {
      const res = await fetch(`/api/booking/${pro.slug}?date=${date}&serviceId=${service.id}`)
      if (res.ok) {
        const data = await res.json()
        setSlotsCache(prev => ({ ...prev, [key]: data.slots ?? [] }))
      }
    } finally {
      setLoadingSlots(null)
    }
  }

  async function handleServiceClick(pro: Professional, service: Service) {
    if (expanded?.proId === pro.id && expanded?.serviceId === service.id) {
      setExpanded(null)
      setPendingBooking(null)
      return
    }
    setExpanded({ proId: pro.id, serviceId: service.id })
    setPendingBooking(null)
    setBookingStatus('idle')
    await fetchSlots(pro, service, selectedDate)
  }

  async function handleDateChange(date: string) {
    setSelectedDate(date)
    setPendingBooking(null)
    if (expanded) {
      const pro = professionals.find(p => p.id === expanded.proId)
      const service = pro?.services.find(s => s.id === expanded.serviceId)
      if (pro && service) await fetchSlots(pro, service, date)
    }
  }

  function handleSlotClick(pro: Professional, service: Service, slot: string) {
    if (!loggedInClient) {
      router.push(`/cliente/login?next=${encodeURIComponent('/profissionais' + (initialTipo ? `?tipo=${initialTipo}` : ''))}`)
      return
    }
    setPendingBooking({
      proSlug: pro.slug!, proName: pro.businessName || pro.name || '',
      service, slot,
    })
    setBookingStatus('idle')
    setBookingError('')
  }

  async function handleConfirm() {
    if (!pendingBooking || !loggedInClient) return
    setBookingStatus('loading')
    try {
      const res = await fetch(`/api/booking/${pendingBooking.proSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: pendingBooking.service.id,
          scheduledAt: `${selectedDate}T${pendingBooking.slot}:00.000Z`,
          customer: {
            name: loggedInClient.name,
            phone: loggedInClient.phone,
            email: loggedInClient.email,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBookingStatus('error')
        setBookingError(data.error || 'Erro ao criar agendamento')
        return
      }
      setBookingStatus('success')
      setPendingBooking(null)
      setTimeout(() => {
        setExpanded(null)
        setBookingStatus('idle')
      }, 5000)
    } catch {
      setBookingStatus('error')
      setBookingError('Erro inesperado. Tente novamente.')
    }
  }

  return (
    <div className="flex gap-6">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col gap-4 w-64 shrink-0">

        {/* Date */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-gray-800">Quando agendar</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={e => handleDateChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 mt-2 capitalize">{formatDateDisplay(selectedDate)}</p>
        </div>

        {/* Price */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-sm font-bold text-gray-800 mb-3">Preço</p>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>R$ 0</span>
            <span className="font-semibold text-gray-800">
              {maxPrice >= 210 ? 'R$ 200+' : `R$ ${maxPrice}`}
            </span>
          </div>
          <input
            type="range"
            min={10} max={210} step={10}
            value={maxPrice}
            onChange={e => setMaxPrice(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">Categorias</p>
          </div>
          <nav className="py-1">
            <Link
              href={`/profissionais${initialCidade ? `?cidade=${encodeURIComponent(initialCidade)}` : ''}${initialQ ? `${initialCidade ? '&' : '?'}q=${encodeURIComponent(initialQ)}` : ''}`}
              className={`flex items-center px-4 py-2.5 text-sm transition-colors ${!initialTipo ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              Todos
            </Link>
            {Object.entries(TIPO_LABELS).map(([value, label]) => (
              <Link
                key={value}
                href={`/profissionais?tipo=${value}${initialCidade ? `&cidade=${encodeURIComponent(initialCidade)}` : ''}${initialQ ? `&q=${encodeURIComponent(initialQ)}` : ''}`}
                className={`flex items-center px-4 py-2.5 text-sm transition-colors ${initialTipo === value ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* ── Results ── */}
      <div className="flex-1 min-w-0 space-y-3">

        {/* Active filter chips */}
        {(initialTipo || initialCidade || initialQ) && (
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {initialTipo && (
              <Link
                href={`/profissionais${initialCidade ? `?cidade=${encodeURIComponent(initialCidade)}` : ''}${initialQ ? `${initialCidade ? '&' : '?'}q=${encodeURIComponent(initialQ)}` : ''}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 border border-blue-400 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                {TIPO_LABELS[initialTipo]} ✕
              </Link>
            )}
            {initialCidade && (
              <Link
                href={`/profissionais${initialTipo ? `?tipo=${initialTipo}` : ''}${initialQ ? `${initialTipo ? '&' : '?'}q=${encodeURIComponent(initialQ)}` : ''}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 border border-blue-400 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                {initialCidade} ✕
              </Link>
            )}
            {initialQ && (
              <Link
                href={`/profissionais${initialTipo ? `?tipo=${initialTipo}` : ''}${initialCidade ? `${initialTipo ? '&' : '?'}cidade=${encodeURIComponent(initialCidade)}` : ''}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 border border-blue-400 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors"
              >
                &ldquo;{initialQ}&rdquo; ✕
              </Link>
            )}
            <Link href="/profissionais" className="text-xs text-gray-400 hover:text-gray-600 underline">
              Limpar todos
            </Link>
          </div>
        )}

        {/* Global success toast */}
        {bookingStatus === 'success' && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <Check className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Agendamento confirmado!</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Consulta o historial em{' '}
                <Link href="/cliente/reservas" className="underline font-semibold">Minhas Reservas</Link>
              </p>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold text-gray-700">Nenhum profissional encontrado</p>
            <p className="text-sm text-gray-500 mt-1">Tenta outros filtros ou aumenta o preço máximo</p>
          </div>
        ) : (
          filtered.map(pro => {
            const location = [pro.city, pro.state].filter(Boolean).join(', ')
            const avgRating = pro.reviews.length > 0
              ? pro.reviews.reduce((s, r) => s + r.rating, 0) / pro.reviews.length : 0

            return (
              <div key={pro.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-all overflow-hidden">

                {/* Pro header */}
                <div className="p-5 flex gap-4">
                  <Link href={`/${pro.slug}`} className="shrink-0">
                    <div className="w-[70px] h-[70px] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-2xl border border-gray-100">
                      {pro.image
                        ? <Image src={pro.image} alt={pro.businessName || ''} width={70} height={70} className="object-cover w-full h-full" />
                        : <span>{TIPO_ICONS[pro.businessType] ?? '📋'}</span>
                      }
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/${pro.slug}`}>
                          <h3 className="font-bold text-gray-900 text-base hover:text-blue-700 transition-colors truncate">
                            {pro.businessName || pro.name || 'Sem nome'}
                            {pro.isFeatured && (
                              <span className="ml-2 text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full align-middle">Destaque</span>
                            )}
                          </h3>
                        </Link>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          {TIPO_LABELS[pro.businessType] ?? 'Profissional'}
                        </span>
                      </div>
                      <Link href={`/${pro.slug}`} className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors hidden sm:block">
                        Ver perfil
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {pro.reviews.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                          <span className="text-xs text-blue-600">({pro.reviews.length})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sem avaliações</span>
                      )}
                      {location && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Services */}
                {pro.services.length > 0 && (
                  <div className="border-t border-gray-100">
                    {pro.services.map((service, idx) => {
                      const isExpanded = expanded?.proId === pro.id && expanded?.serviceId === service.id
                      const key = cacheKey(pro.id, service.id, selectedDate)
                      const slots = slotsCache[key]
                      const isLoading = loadingSlots === key
                      const availableSlots = slots?.filter(s => s.available) ?? []
                      const isPending = pendingBooking?.proSlug === pro.slug && pendingBooking?.service.id === service.id

                      return (
                        <div key={service.id}>
                          {/* Service row */}
                          <button
                            onClick={() => handleServiceClick(pro, service)}
                            className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${idx > 0 ? 'border-t border-gray-50' : ''} ${isExpanded ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm text-gray-900 font-medium truncate">{service.name}</span>
                              <span className="text-xs text-gray-400 shrink-0">({formatDuration(service.duration)})</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                              <span className="text-sm font-bold text-blue-700">{formatPrice(service.price)}</span>
                              {isExpanded
                                ? <ChevronUp className="h-4 w-4 text-gray-400" />
                                : <ChevronDown className="h-4 w-4 text-gray-400" />
                              }
                            </div>
                          </button>

                          {/* Slots panel */}
                          {isExpanded && (
                            <div className="px-5 py-4 bg-blue-50/50 border-t border-blue-100">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                Horários disponíveis · <span className="normal-case font-normal capitalize">{formatDateDisplay(selectedDate)}</span>
                              </p>

                              {isLoading ? (
                                <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  A verificar disponibilidade...
                                </div>
                              ) : slots === undefined ? null : availableSlots.length === 0 ? (
                                <p className="text-sm text-gray-400 py-1">Sem horários disponíveis para esta data.</p>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {availableSlots.map(slot => {
                                    const isSelected = isPending && pendingBooking?.slot === slot.time
                                    return (
                                      <button
                                        key={slot.time}
                                        onClick={() => handleSlotClick(pro, service, slot.time)}
                                        className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                                          isSelected
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-400'
                                        }`}
                                      >
                                        {slot.time}
                                      </button>
                                    )
                                  })}
                                </div>
                              )}

                              {/* Not logged in hint */}
                              {checkedAuth && !loggedInClient && availableSlots.length > 0 && (
                                <p className="text-xs text-gray-400 mt-3">
                                  <Link
                                    href={`/cliente/login?next=${encodeURIComponent('/profissionais' + (initialTipo ? `?tipo=${initialTipo}` : ''))}`}
                                    className="text-blue-600 hover:underline font-semibold"
                                  >
                                    Faz login
                                  </Link>{' '}
                                  para reservar um horário.
                                </p>
                              )}

                              {/* Confirmation panel */}
                              {isPending && loggedInClient && bookingStatus !== 'success' && (
                                <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200 shadow-sm">
                                  <p className="text-sm font-semibold text-gray-900 mb-2">Confirmar agendamento</p>
                                  <div className="text-xs text-gray-500 space-y-1 mb-4">
                                    <p>
                                      <span className="font-semibold text-gray-800">{pendingBooking.service.name}</span>
                                      {' · '}{formatDuration(pendingBooking.service.duration)}
                                      {' · '}{formatPrice(pendingBooking.service.price)}
                                    </p>
                                    <p>
                                      <span className="capitalize">{formatDateDisplay(selectedDate)}</span>
                                      {' às '}
                                      <span className="font-semibold text-gray-800">{pendingBooking.slot}</span>
                                    </p>
                                    <p>
                                      Em nome de:{' '}
                                      <span className="font-semibold text-gray-700">{loggedInClient.name}</span>
                                    </p>
                                  </div>
                                  {bookingStatus === 'error' && (
                                    <p className="text-xs text-red-500 mb-3">{bookingError}</p>
                                  )}
                                  <div className="flex gap-2">
                                    <button
                                      onClick={handleConfirm}
                                      disabled={bookingStatus === 'loading'}
                                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-colors"
                                    >
                                      {bookingStatus === 'loading'
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <Check className="h-4 w-4" />
                                      }
                                      {bookingStatus === 'loading' ? 'A reservar...' : 'Confirmar reserva'}
                                    </button>
                                    <button
                                      onClick={() => { setPendingBooking(null); setBookingStatus('idle') }}
                                      className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Ver todos */}
                    {pro.services.length >= 6 && (
                      <div className="border-t border-gray-50 px-5 py-3">
                        <Link href={`/${pro.slug}`} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Ver todos os serviços <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
