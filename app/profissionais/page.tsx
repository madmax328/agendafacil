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
  title: 'Encontrar Profissionais | AgendaFácil',
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
      _count: { select: { services: { where: { active: true } } } },
    },
    orderBy: { createdAt: 'desc' },
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
          <Card
            key={pro.id}
            className="hover:shadow-md transition-shadow border-gray-200 overflow-hidden"
          >
            <CardContent className="p-0">
              {/* Color header based on type */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 h-2" />
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl shrink-0">{emoji}</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate leading-tight">
                      {pro.businessName || pro.name || 'Sem nome'}
                    </h3>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {label}
                    </Badge>
                  </div>
                </div>

                {location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{pro._count.services} serviço{pro._count.services !== 1 ? 's' : ''} disponível{pro._count.services !== 1 ? 'is' : ''}</span>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-1.5 mt-1"
                >
                  <Link href={`/${pro.slug}`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    Agendar agora
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Calendar className="h-7 w-7" />
            <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-90">
              AgendaFácil
            </Link>
          </div>
          <h1 className="text-3xl font-bold mt-2">Encontre um profissional</h1>
          <p className="text-blue-100 mt-2 text-sm">
            Salões, clínicas, dentistas e muito mais — agende online em segundos
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Search + filters */}
        <ProfissionaisSearch initialTipo={tipo} initialCidade={cidade} initialQ={q} />

        {/* Results count indicator */}
        {hasFilters && (
          <p className="text-sm text-gray-500">
            Mostrando resultados para
            {q && <strong className="text-gray-700"> &quot;{q}&quot;</strong>}
            {tipo && <span> · {BUSINESS_TYPE_LABELS[tipo] ?? tipo}</span>}
            {cidade && <span> · {cidade}</span>}
          </p>
        )}

        {/* List */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-gray-200 animate-pulse" />
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
