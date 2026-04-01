import Link from 'next/link'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import {
  Calendar,
  Search,
  MapPin,
  Star,
  ArrowRight,
  Scissors,
  Stethoscope,
  Brain,
  Smile,
  Dumbbell,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'

export const metadata = {
  title: 'AgendaFácil – Agende Online com os Melhores Profissionais',
  description:
    'Encontre salões, clínicas, dentistas, psicólogos e muito mais perto de você. Agende online 24h, sem precisar ligar ou mandar mensagem.',
}

const CATEGORIES = [
  { value: 'salao', label: 'Salão de Beleza', emoji: '💇', color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100' },
  { value: 'barbearia', label: 'Barbearia', emoji: '✂️', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { value: 'dentista', label: 'Dentista', emoji: '🦷', color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100' },
  { value: 'psicologo', label: 'Psicólogo', emoji: '🧠', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { value: 'clinica', label: 'Clínica', emoji: '🏥', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
  { value: 'estetica', label: 'Estética', emoji: '✨', color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
  { value: 'massagem', label: 'Massagem', emoji: '💆', color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' },
  { value: 'nutricionista', label: 'Nutricionista', emoji: '🥗', color: 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100' },
]

async function getFeaturedProfessionals(city?: string) {
  // Try to show pros from visitor's city first, fall back to all
  if (city) {
    const local = await prisma.professional.findMany({
      where: { slug: { not: null }, city: { contains: city, mode: 'insensitive' } },
      select: {
        id: true, slug: true, name: true, businessName: true,
        businessType: true, city: true, state: true,
        isFeatured: true,
        _count: { select: { services: { where: { active: true } } } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 6,
    })
    if (local.length >= 3) return local
  }
  return prisma.professional.findMany({
    where: { slug: { not: null } },
    select: {
      id: true, slug: true, name: true, businessName: true,
      businessType: true, city: true, state: true,
      isFeatured: true,
      _count: { select: { services: { where: { active: true } } } },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 6,
  })
}

const TYPE_EMOJI: Record<string, string> = {
  salao: '💇', barbearia: '✂️', clinica: '🏥', dentista: '🦷',
  psicologo: '🧠', estetica: '✨', massagem: '💆', nutricionista: '🥗',
  fisioterapia: '🦴', outros: '📋',
}
const TYPE_LABEL: Record<string, string> = {
  salao: 'Salão de Beleza', barbearia: 'Barbearia', clinica: 'Clínica',
  dentista: 'Dentista', psicologo: 'Psicólogo', estetica: 'Estética',
  massagem: 'Massagem', nutricionista: 'Nutricionista', fisioterapia: 'Fisioterapia', outros: 'Profissional',
}

export default async function HomePage() {
  // Vercel injects x-vercel-ip-city header (URL-encoded), e.g. "S%C3%A3o%20Paulo"
  const headersList = await headers()
  const rawCity = headersList.get('x-vercel-ip-city') ?? ''
  const visitorCity = rawCity ? decodeURIComponent(rawCity) : undefined
  const featured = await getFeaturedProfessionals(visitorCity)

  return (
    <div className="min-h-screen bg-white">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AgendaFácil</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/profissionais" className="hover:text-blue-600 transition-colors">Explorar profissionais</Link>
            <Link href="/para-profissionais" className="hover:text-blue-600 transition-colors">Para profissionais</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Entrar
            </Link>
            <Link
              href="/para-profissionais"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Cadastre seu negócio
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            Agende online 24h, sem precisar ligar
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-5">
            Encontre e agende
            <br />
            <span className="text-blue-200">com quem você confia</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Salões, clínicas, dentistas, psicólogos e muito mais.
            Escolha o horário que quiser e confirme em segundos.
          </p>

          {/* Search bar */}
          <form action="/profissionais" method="get" className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                name="q"
                type="text"
                placeholder="Busque por serviço ou profissional..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
              />
            </div>
            <div className="relative sm:w-44">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                name="cidade"
                type="text"
                placeholder="Cidade..."
                className="w-full pl-11 pr-4 py-3.5 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-lg shrink-0"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* ── CATEGORIAS ── */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-medium text-gray-500 mb-6">Navegue por categoria</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/profissionais?tipo=${cat.value}`}
                className={`flex flex-col items-center gap-2 border rounded-xl py-4 px-2 text-xs font-medium transition-colors text-center ${cat.color}`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFISSIONAIS EM DESTAQUE ── */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {visitorCity ? `Profissionais em ${visitorCity}` : 'Profissionais em destaque'}
                </h2>
                {visitorCity && (
                  <p className="text-sm text-gray-500 mt-1">
                    Encontramos profissionais perto de você
                  </p>
                )}
              </div>
              <Link href="/profissionais" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((pro) => {
                const emoji = TYPE_EMOJI[pro.businessType] ?? '📋'
                const typeLabel = TYPE_LABEL[pro.businessType] ?? 'Profissional'
                const location = [pro.city, pro.state].filter(Boolean).join(', ')
                return (
                  <Link
                    key={pro.id}
                    href={`/${pro.slug}`}
                    className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all group"
                  >
                    <div className="text-3xl shrink-0 bg-gray-50 rounded-xl w-14 h-14 flex items-center justify-center">
                      {emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                          {pro.businessName || pro.name || 'Sem nome'}
                        </p>
                        {pro.isFeatured && (
                          <span className="shrink-0 text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded-full">
                            ⭐ Destaque
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{typeLabel}</p>
                      {location && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {location}
                        </div>
                      )}
                      <p className="text-xs text-blue-600 font-medium mt-2">
                        {pro._count.services} serviço{pro._count.services !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── COMO FUNCIONA (cliente) ── */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Como funciona para você</h2>
          <p className="text-gray-500 mb-12">Agende em menos de 1 minuto, sem criar conta</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', emoji: '🔍', title: 'Encontre o profissional', desc: 'Busque por serviço, tipo ou cidade. Veja os horários disponíveis em tempo real.' },
              { step: '2', emoji: '📅', title: 'Escolha o horário', desc: 'Selecione o dia e horário que desejar. Veja os serviços e preços disponíveis.' },
              { step: '3', emoji: '✅', title: 'Confirmação na hora', desc: 'Receba confirmação por e-mail. O profissional cuida do lembrete automático.' },
            ].map(({ step, emoji, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-6 shadow-sm text-left">
                <div className="text-3xl mb-4">{emoji}</div>
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mb-3">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/profissionais"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-md"
            >
              Encontrar profissional agora
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── VANTAGENS PARA CLIENTES ── */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Por que usar o AgendaFácil?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { emoji: '🕐', title: 'Disponível 24h', desc: 'Agende a qualquer hora, inclusive no fim de semana ou de madrugada.' },
              { emoji: '🔔', title: 'Lembrete automático', desc: 'Receba lembretes para não esquecer seu compromisso.' },
              { emoji: '📱', title: 'Sem download de app', desc: 'Tudo pelo celular ou computador, diretamente no navegador.' },
              { emoji: '💳', title: 'Pix integrado', desc: 'Pague com antecedência via Pix e garanta seu horário.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-gray-50 rounded-xl p-5 border border-gray-100">
                <span className="text-2xl shrink-0">{emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA PARA PROFISSIONAIS ── */}
      <section className="bg-gray-900 py-14 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="text-sm font-medium text-blue-400 mb-1">Você é profissional?</p>
            <h3 className="text-2xl font-bold">Cadastre seu negócio gratuitamente</h3>
            <p className="text-gray-400 text-sm mt-2">
              Tenha sua página de agendamento, lembretes automáticos e muito mais.
            </p>
          </div>
          <Link
            href="/para-profissionais"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors flex items-center gap-2 shadow-md"
          >
            Saiba mais
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-500 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">AgendaFácil</span>
          </div>
          <p>© {new Date().getFullYear()} AgendaFácil. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/para-profissionais" className="hover:text-white transition-colors">Para profissionais</Link>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
