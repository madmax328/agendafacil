import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Calendar } from 'lucide-react'
import { ProfissionaisSearch } from './search'
import { ProfissionaisClient } from './client'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://www.markou.app'

export const metadata = {
  title: 'Encontrar Profissionais | Markou',
  description: 'Encontre salões de beleza, clínicas, dentistas e outros profissionais perto de você e agende online.',
  alternates: { canonical: `${BASE_URL}/profissionais` },
  robots: { index: true, follow: true },
}

async function fetchProfessionals(tipo?: string, cidade?: string, q?: string) {
  return prisma.professional.findMany({
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
        select: { id: true, name: true, duration: true, price: true },
        orderBy: { price: 'asc' },
        take: 6,
      },
      reviews: { select: { rating: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { isDemo: 'asc' }, { createdAt: 'desc' }],
    take: 60,
  })
}

export default async function ProfissionaisPage({
  searchParams,
}: {
  searchParams: { tipo?: string; cidade?: string; q?: string }
}) {
  const { tipo, cidade, q } = searchParams
  const professionals = await fetchProfessionals(tipo, cidade, q)

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
          <Link href="/para-profissionais" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hidden sm:block">
            Para profissionais →
          </Link>
        </div>
      </header>

      {/* Search bar */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ProfissionaisSearch initialTipo={tipo} initialCidade={cidade} initialQ={q} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <ProfissionaisClient
          professionals={professionals as any}
          initialTipo={tipo}
          initialCidade={cidade}
          initialQ={q}
        />
      </div>
    </div>
  )
}
