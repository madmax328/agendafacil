import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Calendar, MapPin, Search, Star, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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

const TYPE_EMOJI: Record<string, string> = {
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

async function ProfissionaisList({
  tipo,
  cidade,
  q,
}: {
  tipo?: string
  cidade?: string
  q?: string
}) {
  const professionals = await prisma.professional.findMany({
    where: {
      slug: { not: null },
      ...(tipo ? { businessType: tipo } : {}),
      ...(cidade ? { city: { contains: cidade, mode: 'insensitive' } } : {}),
      ...(q
        ? {
            OR: [
              { businessName: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
              { city: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      slug: true,
      name: true,
      businessName: true,
      businessType: true,
      city: true,
      state: true,
      image: true,
      isDemo: true,
      _count: { select: { services: { where: { active: true } } } },
    },
    orderBy: [{ isDemo: 'asc' }, { createdAt: 'desc' }],
    take: 60,
  })

  if (professionals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-lg font-semibold text-gray-700">Nenhum profissional encontrado</p>
        <p className="text-sm text-gray-500 mt-1">Tente outros termos ou remova os filtros</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {professionals.map((pro) => {
        const label = BUSINESS_TYPE_LABELS[pro.businessType] ?? 'Profissional'
        const emoji = TYPE_EMOJI[pro.businessType] ?? '📋'
        const location = [pro.city, pro.state].filter(Boolean).join(', ')
        return (
          <Link
            key={pro.id}
            href={`/${pro.slug}`}
            className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
          >
            {/* Type color bar */}
            <div className="h-1.5 bg-blue-600 w-full" />
            <div className="p-5 flex flex-col flex-1 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shrink-0">
                  {emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 truncate leading-tight group-hover:text-blue-700 transition-colors">
                      {pro.businessName || pro.name || 'Sem nome'}
                    </h3>
                    {pro.isDemo && (
                      <span className="shrink-0 text-[10px] font-semibold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                        Demo
                      </span>
                    )}
                  </div>
                  <span className="inline-block mt-1 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {label}
                  </span>
                </div>
              </div>

              {location && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Star className="h-3.5 w-3.5 shrink-0 text-yellow-400 fill-yellow-400" />
                <span>{pro._count.services} serviço{pro._count.services !== 1 ? 's' : ''} disponível{pro._count.services !== 1 ? 'is' : ''}</span>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Agendamento online</span>
                <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Agendar <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Link>
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
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-xl p-1.5">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Markou</span>
          </Link>
          <Link href="/para-profissionais" className="text-sm font-bold text-blue-600 hover:text-blue-700 hidden sm:block">
            Para profissionais →
          </Link>
        </div>
      </header>

      {/* Search header */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-5">Encontre um profissional</h1>
          <ProfissionaisSearch initialTipo={tipo} initialCidade={cidade} initialQ={q} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {hasFilters && (
          <p className="text-sm text-gray-500">
            Resultados para
            {q && <strong className="text-gray-700"> &ldquo;{q}&rdquo;</strong>}
            {tipo && <span> · {BUSINESS_TYPE_LABELS[tipo] ?? tipo}</span>}
            {cidade && <span> · {cidade}</span>}
          </p>
        )}

        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          }
        >
          <ProfissionaisList tipo={tipo} cidade={cidade} q={q} />
        </Suspense>
      </div>
    </div>
  )
}
