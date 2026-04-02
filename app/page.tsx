import Link from 'next/link'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
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

export const metadata = {
  title: 'AgendaFácil – Agende Online com os Melhores Profissionais',
  description:
    'Encontre salões, clínicas, dentistas, psicólogos e muito mais perto de você. Agende online 24h, sem precisar ligar ou mandar mensagem.',
}

const CATEGORIES = [
  { value: 'salao',        label: 'Salão',        emoji: '💇' },
  { value: 'barbearia',    label: 'Barbearia',     emoji: '✂️' },
  { value: 'dentista',     label: 'Dentista',      emoji: '🦷' },
  { value: 'psicologo',    label: 'Psicólogo',     emoji: '🧠' },
  { value: 'clinica',      label: 'Clínica',       emoji: '🏥' },
  { value: 'estetica',     label: 'Estética',      emoji: '✨' },
  { value: 'nutricionista',label: 'Nutrição',      emoji: '🥗' },
  { value: 'personal',     label: 'Personal',      emoji: '💪' },
]

async function getFeaturedProfessionals(city?: string) {
  if (city) {
    const local = await prisma.professional.findMany({
      where: { slug: { not: null }, city: { contains: city, mode: 'insensitive' } },
      select: {
        id: true, slug: true, name: true, businessName: true,
        businessType: true, city: true, state: true, isFeatured: true,
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
      businessType: true, city: true, state: true, isFeatured: true,
      _count: { select: { services: { where: { active: true } } } },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 6,
  })
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

// Colour per type for avatar background
const TYPE_COLOR: Record<string, string> = {
  salao: 'bg-pink-100 text-pink-700', barbearia: 'bg-blue-100 text-blue-700',
  clinica: 'bg-green-100 text-green-700', dentista: 'bg-cyan-100 text-cyan-700',
  psicologo: 'bg-purple-100 text-purple-700', estetica: 'bg-yellow-100 text-yellow-700',
  massagem: 'bg-orange-100 text-orange-700', nutricionista: 'bg-lime-100 text-lime-700',
  personal: 'bg-red-100 text-red-700', outros: 'bg-gray-100 text-gray-700',
}

export default async function HomePage() {
  const headersList = await headers()
  const rawCity = headersList.get('x-vercel-ip-city') ?? ''
  const visitorCity = rawCity ? decodeURIComponent(rawCity) : undefined
  const featured = await getFeaturedProfessionals(visitorCity)

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 rounded-xl p-1.5 shadow-sm shadow-blue-200">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">AgendaFácil</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <Link href="/profissionais" className="hover:text-gray-900 transition-colors">Explorar</Link>
            <Link href="/para-profissionais" className="hover:text-gray-900 transition-colors">Para profissionais</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Entrar
            </Link>
            <Link
              href="/para-profissionais"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Cadastre seu negócio
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm font-medium text-blue-200 mb-6">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                Agendamento online em segundos
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
                Reserve com os
                <br />
                <span className="text-blue-300">melhores perto</span>
                <br />
                de você
              </h1>
              <p className="text-lg text-blue-100/80 mb-8 leading-relaxed">
                Salões, clínicas, dentistas e muito mais.
                Escolha o horário, confirme em segundos — sem ligar, sem esperar.
              </p>

              {/* Search */}
              <form action="/profissionais" method="get" className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none h-[18px] w-[18px]" />
                  <input
                    name="q"
                    type="text"
                    placeholder="Serviço ou profissional..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
                  />
                </div>
                <div className="relative sm:w-40">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 pointer-events-none" />
                  <input
                    name="cidade"
                    type="text"
                    placeholder="Cidade..."
                    defaultValue={visitorCity ?? ''}
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg shrink-0"
                >
                  Buscar
                </button>
              </form>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-5 mt-6">
                {[
                  { icon: CheckCircle2, text: 'Sem criar conta' },
                  { icon: Clock, text: 'Disponível 24h' },
                  { icon: Shield, text: 'Confirmação por e-mail' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-sm text-blue-200/70">
                    <Icon className="h-4 w-4 text-blue-400" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mock booking card */}
            <div className="hidden md:block">
              <div className="bg-white rounded-2xl shadow-2xl p-5 max-w-sm ml-auto border border-white/10">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-lg">💇</div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Studio Beleza Silva</p>
                    <p className="text-xs text-gray-400">Salão de Beleza · São Paulo</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-xs text-yellow-600 font-semibold bg-yellow-50 px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />4.9
                  </div>
                </div>
                {/* Services */}
                <div className="py-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Serviços</p>
                  {[
                    { name: 'Corte + Escova', time: '60 min', price: 'R$ 80' },
                    { name: 'Coloração', time: '120 min', price: 'R$ 180' },
                  ].map((s, i) => (
                    <div key={s.name} className={`flex items-center justify-between p-2.5 rounded-xl text-sm ${i === 0 ? 'bg-blue-50 border-2 border-blue-200' : 'border border-gray-100'}`}>
                      <span className={`font-medium ${i === 0 ? 'text-blue-700' : 'text-gray-600'}`}>{s.name}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{s.time}</span>
                        <span className="font-semibold text-gray-700">{s.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Slots */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Horários de amanhã</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map((t, i) => (
                      <div key={t} className={`py-2 rounded-lg text-xs font-semibold text-center ${i === 2 ? 'bg-blue-600 text-white shadow' : 'bg-gray-50 text-gray-600'}`}>{t}</div>
                    ))}
                    <div className="py-2 rounded-lg text-xs font-semibold text-center bg-red-50 text-red-300 line-through">18:00</div>
                  </div>
                </div>
                <button className="w-full mt-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow">
                  Confirmar agendamento ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIAS ── */}
      <section className="py-10 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/profissionais?tipo=${cat.value}`}
                className="group flex flex-col items-center gap-2 py-4 px-2 rounded-2xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600 transition-colors text-center leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROFISSIONAIS EM DESTAQUE ── */}
      {featured.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-1">
                  {visitorCity ? `📍 ${visitorCity}` : 'Em destaque'}
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {visitorCity ? `Profissionais perto de você` : 'Profissionais em destaque'}
                </h2>
              </div>
              <Link href="/profissionais" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 group">
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
                    className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 font-medium`}>
                        {emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-gray-900 truncate text-sm group-hover:text-blue-700 transition-colors leading-snug">
                            {pro.businessName || pro.name || 'Sem nome'}
                          </p>
                          {pro.isFeatured && (
                            <span className="shrink-0 text-[10px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                              ⭐
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
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {pro._count.services} serviço{pro._count.services !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
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
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm font-semibold text-blue-600 mb-2">Simples e rápido</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Agende em menos de 1 minuto</h2>
          <p className="text-gray-500 mb-14">Sem criar conta, sem baixar app</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '1', emoji: '🔍', title: 'Encontre o profissional', desc: 'Busque por tipo de serviço ou cidade. Veja disponibilidade em tempo real.' },
              { num: '2', emoji: '📅', title: 'Escolha data e horário', desc: 'Selecione o dia e a hora que preferir. Sem precisar ligar ou esperar resposta.' },
              { num: '3', emoji: '✅', title: 'Receba a confirmação', desc: 'Confirmação imediata por e-mail. O profissional fica avisado automaticamente.' },
            ].map(({ num, emoji, title, desc }) => (
              <div key={num} className="relative text-center p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                <div className="text-4xl mb-4">{emoji}</div>
                <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/profissionais"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors mt-12 shadow-lg shadow-blue-200"
          >
            Encontrar profissional agora
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── CTA PARA PROFISSIONAIS ── */}
      <section className="bg-gradient-to-r from-slate-900 to-blue-950 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-blue-400 text-sm font-semibold mb-2">Você é profissional?</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Tenha sua agenda online em 10 minutos
              </h3>
              <p className="text-gray-400 text-sm max-w-md">
                Clientes marcam sozinhos 24h. Confirmação automática por e-mail. Começa grátis, sem cartão.
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 shrink-0">
              <Link
                href="/para-profissionais"
                className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl transition-colors flex items-center gap-2 shadow-lg text-lg whitespace-nowrap"
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
            <span className="font-bold text-white">AgendaFácil</span>
          </div>
          <p className="text-gray-600">© {new Date().getFullYear()} AgendaFácil. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/para-profissionais" className="hover:text-white transition-colors">Para profissionais</Link>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
