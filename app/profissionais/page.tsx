import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Calendar, MapPin, Star, ChevronRight } from 'lucide-react'
import { ProfissionaisSearch } from './search'

export const metadata = {
  title: 'Encontrar Profissionais | Markou',
  description: 'Encontre salões de beleza, clínicas, dentistas e outros profissionais perto de você e agende online.',
}

const BUSINESS_TYPE_LABELS: Record<string, string> = {
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
  salao: '💇',
  barbearia: '✂️',
  clinica: '🏥',
  dentista: '🦷',
  psicologo: '🧠',
  estetica: '✨',
  massagem: '💆',
  nutricionista: '🥗',
  fisioterapia: '🦴',
  outros: '📋',
}

const SIDEBAR_TYPES = [
  { value: 'salao', label: 'Salão de Beleza' },
  { value: 'barbearia', label: 'Barbearia' },
  { value: 'clinica', label: 'Clínica' },
  { value: 'dentista', label: 'Dentista' },
  { value: 'psicologo', label: 'Psicólogo' },
  { value: 'estetica', label: 'Estética' },
  { value: 'massagem', label: 'Massagem' },
  { value: 'nutricionista', label: 'Nutricionista' },
  { value: 'fisioterapia', label: 'Fisioterapia' },
  { value: 'outros', label: 'Outro' },
]

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating)
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < full ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-700">{rating.toFixed(1)}</span>
      <span className="text-xs text-gray-400">({count})</span>
    </div>
  )
}

async function ProfissionaisList({ tipo, cidade, q }: { tipo?: string; cidade?: string; q?: string }) {
  const professionals = await prisma.professional.findMany({
    where: {
      slug: { not: null },
      ...(tipo ? { businessType: tipo } : {}),
      ...(cidade ? { city: { contains: cidade, mode: 'insensitive' } } : {}),
      ...(q ? {
        OR: [
          { businessName: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    select: {
      id: true, slug: true, name: true, businessName: true,
      businessType: true, city: true, state: true, image: true,
      isFeatured: true, isDemo: true,
      services: {
        where: { active: true },
        select: { name: true, duration: true, price: true },
        orderBy: { price: 'asc' },
        take: 5,
      },
      reviews: { select: { rating: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { isDemo: 'asc' }, { createdAt: 'desc' }],
    take: 60,
  })

  if (professionals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-lg font-semibold text-gray-700">Nenhum profissional encontrado</p>
        <p className="text-sm text-gray-500 mt-1">Tente outros termos ou remova os filtros</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {professionals.map((pro) => {
        const label = BUSINESS_TYPE_LABELS[pro.businessType] ?? 'Profissional'
        const icon = TIPO_ICONS[pro.businessType] ?? '📋'
        const location = [pro.city, pro.state].filter(Boolean).join(', ')
        const avgRating = pro.reviews.length > 0
          ? pro.reviews.reduce((s, r) => s + r.rating, 0) / pro.reviews.length
          : 0
        const reviewCount = pro.reviews.length
        const visibleServices = pro.services.slice(0, 4)
        const extraCount = pro.services.length - visibleServices.length

        return (
          <div key={pro.id} className="bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden">
            <div className="p-5">
              <div className="flex gap-4">
                {/* Photo */}
                <Link href={`/${pro.slug}`} className="shrink-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-blue-50 flex items-center justify-center text-3xl border border-gray-100">
                    {pro.image ? (
                      <Image src={pro.image} alt={pro.businessName || pro.name || ''} width={64} height={64} className="object-cover w-full h-full" />
                    ) : (
                      <span>{icon}</span>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <Link href={`/${pro.slug}`}>
                        <h3 className="font-bold text-gray-900 text-base hover:text-blue-700 transition-colors leading-tight">
                          {pro.businessName || pro.name || 'Sem nome'}
                          {pro.isFeatured && (
                            <span className="ml-2 text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full align-middle">Destaque</span>
                          )}
                        </h3>
                      </Link>
                      <span className="inline-block mt-1 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{label}</span>
                    </div>
                    <Link
                      href={`/${pro.slug}`}
                      className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      Agendar
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {reviewCount > 0 ? (
                      <StarRating rating={avgRating} count={reviewCount} />
                    ) : (
                      <span className="text-xs text-gray-400">Sem avaliações ainda</span>
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

              {/* Services list */}
              {visibleServices.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-3 space-y-0">
                  {visibleServices.map((svc, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm text-gray-800 truncate">{svc.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">({formatDuration(svc.duration)})</span>
                      </div>
                      <span className="text-sm font-semibold text-blue-700 shrink-0 ml-4">{formatPrice(svc.price)}</span>
                    </div>
                  ))}
                  {extraCount > 0 && (
                    <Link
                      href={`/${pro.slug}`}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium pt-2"
                    >
                      Ver todos os serviços ({pro.services.length}) <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ProfissionaisPage({
  searchParams,
}: {
  searchParams: { tipo?: string; cidade?: string; q?: string }
}) {
  const { tipo, cidade, q } = searchParams
  const hasFilters = !!(tipo || cidade || q)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-xl p-1.5">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Markou</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/para-profissionais" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hidden sm:block">
              Para profissionais →
            </Link>
          </nav>
        </div>
      </header>

      {/* Search bar */}
      <div className="bg-white border-b border-gray-200 py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ProfissionaisSearch initialTipo={tipo} initialCidade={cidade} initialQ={q} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">

          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">Categorias</h2>
              </div>
              <nav className="py-2">
                <Link
                  href="/profissionais"
                  className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                    !tipo ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">🔍</span>
                  Todos
                </Link>
                {SIDEBAR_TYPES.map(t => (
                  <Link
                    key={t.value}
                    href={`/profissionais?tipo=${t.value}${cidade ? `&cidade=${encodeURIComponent(cidade)}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                    className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                      tipo === t.value ? 'bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base">{TIPO_ICONS[t.value]}</span>
                    {t.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {tipo ? BUSINESS_TYPE_LABELS[tipo] : 'Todos os profissionais'}
                  {cidade && <span className="text-gray-500 font-normal"> em {cidade}</span>}
                </h1>
                {hasFilters && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {tipo && (
                      <Link
                        href={`/profissionais${cidade ? `?cidade=${encodeURIComponent(cidade)}` : ''}${q ? `${cidade ? '&' : '?'}q=${encodeURIComponent(q)}` : ''}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
                      >
                        {BUSINESS_TYPE_LABELS[tipo]} ✕
                      </Link>
                    )}
                    {cidade && (
                      <Link
                        href={`/profissionais${tipo ? `?tipo=${tipo}` : ''}${q ? `${tipo ? '&' : '?'}q=${encodeURIComponent(q)}` : ''}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
                      >
                        {cidade} ✕
                      </Link>
                    )}
                    {q && (
                      <Link
                        href={`/profissionais${tipo ? `?tipo=${tipo}` : ''}${cidade ? `${tipo ? '&' : '?'}cidade=${encodeURIComponent(cidade)}` : ''}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-200 transition-colors"
                      >
                        &ldquo;{q}&rdquo; ✕
                      </Link>
                    )}
                    <Link href="/profissionais" className="text-xs text-gray-400 hover:text-gray-600 underline">
                      Limpar todos
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <Suspense
              fallback={
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              }
            >
              <ProfissionaisList tipo={tipo} cidade={cidade} q={q} />
            </Suspense>
          </div>

        </div>
      </div>
    </div>
  )
}
