import Link from 'next/link'
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import {
  Calendar,
  Search,
  MapPin,
  ArrowRight,
  Star,
  CheckCircle2,
  Clock,
  Shield,
} from 'lucide-react'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://markou.app'

export const metadata = {
  title: 'Markou – Agende Online com os Melhores Profissionais',
  description:
    'Encontre salões, clínicas, dentistas, psicólogos e muito mais perto de você. Agende online 24h, sem precisar ligar ou mandar mensagem.',
  keywords: [
    'agendamento online', 'agendar horário', 'reserva online',
    'salão de beleza online', 'barbearia agendamento', 'dentista agendamento',
    'psicólogo online', 'agenda profissional', 'Markou',
  ],
  openGraph: {
    title: 'Markou – Agende Online com os Melhores Profissionais',
    description: 'Encontre salões, clínicas, dentistas, psicólogos e muito mais. Agende online 24h.',
    url: BASE_URL,
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Markou',
  },
  alternates: { canonical: BASE_URL },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Markou',
  url: BASE_URL,
  description: 'Plataforma de agendamento online para profissionais e clientes no Brasil.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/profissionais?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Markou',
  url: BASE_URL,
  logo: `${BASE_URL}/icon.svg`,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: 'Portuguese',
  },
}

const CATEGORIES = [
  { value: 'salao',         label: 'CABELOS',      emoji: '💇' },
  { value: 'barbearia',     label: 'BARBEARIA',    emoji: '✂️' },
  { value: 'estetica',      label: 'ESTÉTICA',     emoji: '✨' },
  { value: 'dentista',      label: 'DENTISTA',     emoji: '🦷' },
  { value: 'psicologo',     label: 'PSICÓLOGO',    emoji: '🧠' },
  { value: 'clinica',       label: 'CLÍNICA',      emoji: '🏥' },
  { value: 'personal',      label: 'PERSONAL',     emoji: '💪' },
  { value: 'nutricionista', label: 'NUTRIÇÃO',     emoji: '🥗' },
]

const PRO_SELECT = {
  id: true, slug: true, name: true, businessName: true,
  businessType: true, city: true, state: true, isFeatured: true, isDemo: true,
  _count: { select: { services: { where: { active: true } } } },
} as const

async function getFeaturedProfessionals(city?: string): Promise<{
  professionals: Awaited<ReturnType<typeof prisma.professional.findMany<{ select: typeof PRO_SELECT }>>>
  isLocal: boolean
}> {
  if (city) {
    const local = await prisma.professional.findMany({
      where: { slug: { not: null }, city: { contains: city, mode: 'insensitive' } },
      select: PRO_SELECT,
      orderBy: [{ isFeatured: 'desc' }, { isDemo: 'asc' }, { createdAt: 'desc' }],
      take: 6,
    })
    if (local.length > 0) return { professionals: local, isLocal: true }
  }
  const all = await prisma.professional.findMany({
    where: { slug: { not: null } },
    select: PRO_SELECT,
    orderBy: [{ isFeatured: 'desc' }, { isDemo: 'asc' }, { createdAt: 'desc' }],
    take: 6,
  })
  return { professionals: all, isLocal: false }
}

const TYPE_EMOJI: Record<string, string> = {
  salao: '💇', barbearia: '✂️', clinica: '🏥', dentista: '🦷',
  psicologo: '🧠', estetica: '✨', massagem: '💆', nutricionista: '🥗',
  fisioterapia: '🦴', personal: '💪', outros: '📋',
}
const TYPE_LABEL: Record<string, string> = {
  salao: 'Salão de Beleza', barbearia: 'Barbearia', clinica: 'Clínica',
  dentista: 'Dentista', psicologo: 'Psicólogo', estetica: 'Estética',
  massagem: 'Massagem', nutricionista: 'Nutricionista',
  fisioterapia: 'Fisioterapia', personal: 'Personal Trainer', outros: 'Profissional',
}
const TYPE_COLOR: Record<string, string> = {
  salao: 'bg-pink-100 text-pink-700', barbearia: 'bg-blue-100 text-blue-700',
  clinica: 'bg-green-100 text-green-700', dentista: 'bg-cyan-100 text-cyan-700',
  psicologo: 'bg-purple-100 text-purple-700', estetica: 'bg-yellow-100 text-yellow-700',
  massagem: 'bg-orange-100 text-orange-700', nutricionista: 'bg-lime-100 text-lime-700',
  personal: 'bg-red-100 text-red-700', outros: 'bg-gray-100 text-gray-700',
}

export default async function HomePage() {
  const [headersList, session] = await Promise.all([
    headers(),
    getServerSession(authOptions),
  ])
  const rawCity = headersList.get('x-vercel-ip-city') ?? ''
  const visitorCity = rawCity ? decodeURIComponent(rawCity) : undefined
  const { professionals: featured, isLocal } = await getFeaturedProfessionals(visitorCity)
  const isLoggedInPro = !!session?.user?.id

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-gray-900 rounded-xl p-1.5">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Markou</span>
          </Link>
          {/* Right buttons */}
          <div className="flex items-center gap-2">
            {isLoggedInPro ? (
              <Link href="/dashboard"
                className="text-sm font-bold px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                Meu Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/cliente/login"
                  className="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                  Entrar
                </Link>
                <Link href="/para-profissionais"
                  className="text-sm font-bold px-4 py-2.5 rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                  Para Profissionais
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-white pt-16 pb-8 relative overflow-hidden">
        {/* Dot pattern — white dots visible on dark background */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Encontre e{' '}
            <strong className="font-extrabold">agende</strong>{' '}
            serviços de{' '}
            <strong className="font-extrabold">beleza e bem-estar.</strong>
            <br className="hidden sm:block" />
            <span className="text-gray-500 font-normal text-2xl sm:text-3xl md:text-4xl">
              A qualquer hora, de qualquer lugar.
            </span>
          </h1>

          {/* Search bar */}
          <form action="/profissionais" method="get"
            className="flex flex-col sm:flex-row gap-2 bg-white border-2 border-gray-200 rounded-2xl p-2 shadow-xl max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 pointer-events-none" />
              <input
                name="q"
                type="text"
                placeholder="Estabelecimento ou serviço"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <div className="hidden sm:block w-px bg-gray-200 my-1" />
            <div className="relative sm:w-44">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 pointer-events-none" />
              <input
                name="cidade"
                type="text"
                placeholder="Cidade"
                defaultValue={visitorCity ?? ''}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-gray-900 hover:bg-gray-700 text-white font-bold px-8 py-3 rounded-xl transition-colors shrink-0 text-sm tracking-wide"
            >
              BUSCAR
            </button>
          </form>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-gray-400">
            {[
              { icon: CheckCircle2, text: 'Sem criar conta' },
              { icon: Clock, text: 'Disponível 24h' },
              { icon: Shield, text: 'Confirmação por e-mail' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-gray-400" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIAS ── */}
      <section className="border-y border-gray-100 bg-white py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/profissionais?tipo=${cat.value}`}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors tracking-wider py-1 border-b-2 border-transparent hover:border-gray-400"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO STRIP — warm background + real photos like Trinks ── */}
      <section className="bg-[#FEF3EC] py-16 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left photo */}
            <div className="w-full md:w-72 h-56 md:h-72 rounded-3xl overflow-hidden shadow-xl shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Profissional de beleza"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Center text */}
            <div className="flex-1 text-center px-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                Agende online nos melhores espaços de beleza e bem-estar.
              </h2>
              <p className="text-gray-500 text-base mb-6">
                Profissionais verificados, horários em tempo real, confirmação automática.
              </p>
              <Link
                href="/profissionais"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-sm"
              >
                Explorar profissionais
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Right photo */}
            <div className="w-full md:w-72 h-56 md:h-72 rounded-3xl overflow-hidden shadow-xl shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://plus.unsplash.com/premium_photo-1683134294916-473fc738750b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Serviço de spa e bem-estar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROFISSIONAIS EM DESTAQUE ── */}
      {featured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">
                  {isLocal ? `📍 ${visitorCity}` : 'Em destaque'}
                </p>
                <h2 className="text-2xl font-extrabold text-gray-900">
                  {isLocal ? 'Profissionais perto de você' : 'Profissionais em destaque'}
                </h2>
              </div>
              <Link href="/profissionais" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 group">
                Ver todos
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((pro) => {
                const emoji = TYPE_EMOJI[pro.businessType] ?? '📋'
                const typeLabel = TYPE_LABEL[pro.businessType] ?? 'Profissional'
                const color = TYPE_COLOR[pro.businessType] ?? 'bg-gray-100 text-gray-700'
                const location = [pro.city, pro.state].filter(Boolean).join(', ')
                return (
                  <Link
                    key={pro.id}
                    href={`/${pro.slug}`}
                    className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-400 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                        {emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-gray-900 truncate text-sm group-hover:text-gray-700 transition-colors leading-snug">
                            {pro.businessName || pro.name || 'Sem nome'}
                          </p>
                          {pro.isFeatured && (
                            <span className="shrink-0 text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">⭐</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{typeLabel}</p>
                        {location && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {pro._count.services} serviço{pro._count.services !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Agendar <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── COMO FUNCIONA ── */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Simples e rápido</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Agende em menos de 1 minuto</h2>
          <p className="text-gray-500 mb-14">Sem criar conta, sem baixar app</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', emoji: '🔍', title: 'Encontre o profissional', desc: 'Busque por tipo de serviço ou cidade. Veja disponibilidade em tempo real.' },
              { step: '02', emoji: '📅', title: 'Escolha data e horário', desc: 'Selecione o dia e a hora que preferir. Sem precisar ligar ou esperar resposta.' },
              { step: '03', emoji: '✅', title: 'Receba a confirmação', desc: 'Confirmação imediata por e-mail. O profissional fica avisado automaticamente.' },
            ].map(({ step, emoji, title, desc }) => (
              <div key={step} className="bg-white text-center p-8 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-5xl font-black text-gray-100 leading-none mb-3">{step}</p>
                <div className="text-4xl mb-4 -mt-2">{emoji}</div>
                <h3 className="font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/profissionais"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-xl transition-colors mt-12"
          >
            Encontrar profissional agora
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── CTA PARA PROFISSIONAIS ── */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">Você é profissional?</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
                Tenha sua agenda online em 10 minutos
              </h3>
              <p className="text-gray-400 text-sm max-w-md">
                Clientes marcam sozinhos 24h. Confirmação automática por e-mail. Começa grátis, sem cartão.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0">
              <Link
                href="/para-profissionais"
                className="bg-white hover:bg-gray-100 text-gray-900 font-extrabold px-8 py-4 rounded-xl transition-colors flex items-center gap-2 text-base whitespace-nowrap"
              >
                Criar minha agenda grátis
                <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-gray-500 text-xs">Sem cartão de crédito · Ativo em 10 min</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-500 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 rounded-xl p-1">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Markou</span>
          </div>
          <p className="text-gray-600">© {new Date().getFullYear()} Markou. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/para-profissionais" className="hover:text-white transition-colors">Para profissionais</Link>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
