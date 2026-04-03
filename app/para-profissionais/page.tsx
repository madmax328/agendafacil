import Link from 'next/link'
import {
  Calendar,
  CreditCard,
  BarChart3,
  Check,
  ArrowRight,
  Star,
  Clock,
  Users,
  Mail,
  ShieldCheck,
  TrendingUp,
  Bell,
  Smartphone,
} from 'lucide-react'

export const metadata = {
  title: 'AgendaFácil para Profissionais – Sua agenda online em minutos',
  description:
    'Adeus no-show. Sua página de agendamento online em 10 minutos. Clientes marcam sozinhos, confirmações automáticas, zero papel.',
}

/* ─── tiny helpers ─────────────────────────────────── */

function BrowserMockup() {
  return (
    <div className="w-full max-w-[600px] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white select-none">
      {/* browser chrome */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200 font-mono">
          agendafacil.com.br/dashboard
        </div>
      </div>
      {/* app shell */}
      <div className="flex" style={{ height: 380 }}>
        {/* sidebar — matches real layout exactly */}
        <div className="w-52 bg-[#2563EB] flex flex-col shrink-0">
          {/* logo */}
          <div className="flex items-center gap-2 px-4 py-4 border-b border-blue-500/40">
            <div className="bg-white/20 rounded-lg p-1.5">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">AgendaFácil</span>
          </div>
          {/* nav */}
          <nav className="flex-1 px-3 py-3 space-y-0.5">
            <p className="px-2 pb-1.5 text-[9px] font-semibold uppercase tracking-wider text-blue-300">Menu principal</p>
            {[
              { icon: BarChart3, label: 'Dashboard', active: true },
              { icon: Calendar, label: 'Agenda', active: false },
              { icon: Users, label: 'Clientes', active: false },
              { icon: TrendingUp, label: 'Serviços', active: false },
              { icon: ShieldCheck, label: 'Configurações', active: false },
              { icon: CreditCard, label: 'Assinatura', active: false },
            ].map(({ icon: Icon, label, active }) => (
              <div key={label} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium ${active ? 'bg-white/20 text-white' : 'text-blue-200'}`}>
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-blue-300'}`} />
                <span>{label}</span>
              </div>
            ))}
          </nav>
          {/* user */}
          <div className="px-3 py-3 border-t border-blue-500/40">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-blue-400 ring-2 ring-white/30 flex items-center justify-center text-white text-xs font-bold shrink-0">AP</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Ana Paula</p>
                <p className="text-[9px] text-blue-200">Plano Starter</p>
              </div>
            </div>
          </div>
        </div>

        {/* main content — matches real dashboard exactly */}
        <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
          {/* top bar */}
          <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between shrink-0">
            <div>
              <p className="text-xs font-bold text-gray-900">Olá, Ana Paula!</p>
              <p className="text-[10px] text-gray-400">Bem-vinda ao seu painel</p>
            </div>
            <div className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
              <span className="text-base leading-none">+</span> Novo agendamento
            </div>
          </div>
          {/* booking link banner */}
          <div className="mx-3 mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2 shrink-0">
            <div className="text-[9px] font-semibold text-blue-700">Seu link:</div>
            <code className="text-[9px] text-blue-800 bg-white border border-blue-200 rounded px-1.5 py-0.5">agendafacil.com.br/ana-paula</code>
          </div>
          {/* stat cards */}
          <div className="grid grid-cols-4 gap-2 px-3 pt-2 shrink-0">
            {[
              { label: 'Hoje', value: '4', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Receita mês', value: 'R$1.240', color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Clientes', value: '48', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Presença', value: '96%', color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className="bg-white rounded-lg p-2 border border-gray-100">
                <p className="text-[9px] text-gray-400 mb-0.5">{label}</p>
                <p className={`text-sm font-extrabold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          {/* appointments */}
          <div className="px-3 pt-2 flex-1 overflow-hidden">
            <div className="bg-white rounded-lg border border-gray-100">
              <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-900">Próximos agendamentos</p>
                <p className="text-[9px] text-blue-600 font-medium">Ver todos →</p>
              </div>
              {[
                { initials: 'MS', name: 'Maria Silva', service: 'Corte + Escova', time: '09:00', color: 'bg-blue-100 text-blue-700', badge: 'bg-green-100 text-green-700', status: 'Confirmado' },
                { initials: 'JP', name: 'João Pedro', service: 'Barba completa', time: '10:30', color: 'bg-purple-100 text-purple-700', badge: 'bg-green-100 text-green-700', status: 'Confirmado' },
                { initials: 'CM', name: 'Carla Matos', service: 'Manicure', time: '14:00', color: 'bg-pink-100 text-pink-700', badge: 'bg-blue-100 text-blue-700', status: 'Pendente' },
              ].map(({ initials, name, service, time, color, badge, status }) => (
                <div key={name} className="flex items-center gap-2.5 px-3 py-2 border-b border-gray-50 last:border-0">
                  <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-[9px] font-bold shrink-0`}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-900 truncate">{name}</p>
                    <p className="text-[9px] text-gray-400 truncate">{service}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] text-gray-500">{time}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${badge}`}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhoneMockup() {
  return (
    <div className="w-[200px] mx-auto rounded-[2.5rem] shadow-2xl overflow-hidden border-[7px] border-slate-800 bg-white select-none">
      {/* notch */}
      <div className="bg-slate-800 h-5 flex items-center justify-center">
        <div className="w-14 h-2 bg-black rounded-full" />
      </div>
      {/* screen — matches real booking page */}
      <div className="bg-gradient-to-b from-blue-50 to-gray-50">
        {/* professional header card */}
        <div className="mx-2 mt-2 bg-white rounded-xl border border-gray-100 p-2.5 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <span className="text-blue-600 font-extrabold text-sm">A</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-gray-900 truncate">Salão da Ana Paula</p>
            <p className="text-[8px] text-gray-500">Salão de Beleza</p>
            <p className="text-[8px] text-gray-400">📍 São Paulo, SP</p>
          </div>
        </div>
        {/* step indicator */}
        <div className="flex justify-center gap-1 py-2">
          {[1,2,3,4,5].map((s) => (
            <div key={s} className={`h-1.5 rounded-full ${s === 1 ? 'w-5 bg-blue-600' : 'w-2 bg-gray-200'}`} />
          ))}
        </div>
        {/* step content card */}
        <div className="mx-2 mb-2 bg-white rounded-xl border border-gray-100 p-3">
          <p className="text-[10px] font-bold text-gray-900 mb-0.5">Escolha o serviço</p>
          <p className="text-[8px] text-gray-400 mb-2.5">Selecione o que deseja agendar</p>
          {/* service cards */}
          <div className="space-y-1.5">
            <div className="border-2 border-blue-500 bg-blue-50 rounded-xl p-2.5 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-900">Corte + Escova</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[8px] text-gray-500">⏱ 60 min</span>
                  <span className="text-[8px] font-bold text-gray-700">R$80</span>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="border border-gray-100 bg-white rounded-xl p-2.5 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-900">Manicure</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[8px] text-gray-500">⏱ 45 min</span>
                  <span className="text-[8px] font-bold text-gray-700">R$45</span>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
            </div>
          </div>
          {/* cta */}
          <div className="bg-blue-600 text-white text-[10px] font-bold text-center py-2 rounded-xl mt-2.5">
            Continuar
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ParaProfissionaisPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AgendaFácil</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#funcionalidades" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#planos" className="hover:text-blue-600 transition-colors">Planos</a>
            <a href="#depoimentos" className="hover:text-blue-600 transition-colors">Depoimentos</a>
            <Link href="/" className="hover:text-blue-600 transition-colors">Para clientes</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors hidden sm:block">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Teste grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-[#FAFAF9] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left col */}
            <div className="flex-1 text-center lg:text-left">
              {/* Social proof pill */}
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-medium text-blue-700 mb-8">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                +500 profissionais já usam o AgendaFácil
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
                Sua agenda cheia.<br />
                <span className="text-blue-600">Sem stress.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-500 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                Clientes marcam sozinhos 24h por dia. Confirmação automática por e-mail. Você para de perder tempo e dinheiro com no-shows.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-6">
                <Link
                  href="/cadastro"
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                >
                  Criar minha agenda grátis
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#planos"
                  className="w-full sm:w-auto border border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-semibold px-8 py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
                >
                  Ver planos
                </Link>
              </div>

              <p className="text-slate-400 text-sm">
                ✓ Grátis para começar &nbsp;·&nbsp; ✓ Ativo em 10 minutos &nbsp;·&nbsp; ✓ Sem cartão de crédito
              </p>

              {/* Mini stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-10 pt-10 border-t border-slate-100">
                {[
                  { num: '70%', label: 'menos no-shows' },
                  { num: '10min', label: 'para ativar' },
                  { num: '24h', label: 'disponível' },
                ].map(({ num, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-extrabold text-slate-900">{num}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right col — browser mockup */}
            <div className="flex-1 w-full flex justify-center lg:justify-end">
              <BrowserMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS / TRUST BAR ── */}
      <section className="border-y border-slate-100 py-5 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-slate-400 mb-4">
            Usado por profissionais de todo o Brasil
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm font-semibold text-slate-400">
            {['Salões de Beleza', 'Barbearias', 'Clínicas', 'Dentistas', 'Psicólogos', 'Personal Trainers', 'Esteticistas', 'Massagistas'].map(s => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FULL-WIDTH PRODUCT HERO ── */}
      <section className="bg-slate-900 py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Tudo que você precisa, numa tela só
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Agenda, clientes, receita e confirmações — em qualquer dispositivo, a qualquer hora.
            </p>
          </div>
          {/* laptop frame */}
          <div className="relative mx-auto max-w-4xl">
            {/* screen */}
            <div className="bg-gray-800 rounded-t-2xl pt-3 px-3">
              <div className="bg-gray-700 rounded-t-xl flex items-center gap-2 px-4 py-2 mb-0">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-gray-600 rounded px-3 py-1 text-xs text-gray-400 font-mono text-center">
                  agendafacil.com.br/agenda
                </div>
              </div>
              {/* app content */}
              <div className="flex bg-white" style={{ height: 320 }}>
                {/* sidebar */}
                <div className="w-48 bg-[#2563EB] flex flex-col shrink-0">
                  <div className="flex items-center gap-2 px-4 py-4 border-b border-blue-500/40">
                    <div className="bg-white/20 rounded-lg p-1.5"><Calendar className="w-4 h-4 text-white" /></div>
                    <span className="text-sm font-bold text-white">AgendaFácil</span>
                  </div>
                  <nav className="flex-1 px-3 py-3 space-y-0.5">
                    {[
                      { icon: BarChart3, label: 'Dashboard', active: false },
                      { icon: Calendar, label: 'Agenda', active: true },
                      { icon: Users, label: 'Clientes', active: false },
                      { icon: TrendingUp, label: 'Serviços', active: false },
                    ].map(({ icon: Icon, label, active }) => (
                      <div key={label} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium ${active ? 'bg-white/20 text-white' : 'text-blue-200'}`}>
                        <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-blue-300'}`} />
                        <span>{label}</span>
                      </div>
                    ))}
                  </nav>
                  <div className="px-3 py-3 border-t border-blue-500/40">
                    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-blue-400 ring-2 ring-white/30 flex items-center justify-center text-white text-xs font-bold shrink-0">AP</div>
                      <div><p className="text-xs font-semibold text-white">Ana Paula</p><p className="text-[9px] text-blue-200">Starter</p></div>
                    </div>
                  </div>
                </div>
                {/* agenda content */}
                <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
                  <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between shrink-0">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Agenda</p>
                      <p className="text-xs text-gray-400">Quinta, 3 de Abril de 2026</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 font-medium">‹ Hoje ›</div>
                      <div className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold">+ Novo</div>
                    </div>
                  </div>
                  {/* time blocks */}
                  <div className="flex-1 overflow-hidden px-4 pt-3">
                    <div className="space-y-2">
                      {[
                        { time: '09:00', name: 'Maria Silva', service: 'Corte + Escova', dur: 60, color: 'bg-blue-500', badge: 'bg-green-100 text-green-700', status: 'Confirmado', value: 'R$80' },
                        { time: '10:30', name: 'João Pedro', service: 'Barba completa', dur: 45, color: 'bg-purple-500', badge: 'bg-green-100 text-green-700', status: 'Confirmado', value: 'R$50' },
                        { time: '14:00', name: 'Carla Matos', service: 'Manicure', dur: 45, color: 'bg-pink-500', badge: 'bg-blue-100 text-blue-700', status: 'Pendente', value: 'R$45' },
                        { time: '16:00', name: 'Pedro Alves', service: 'Corte masculino', dur: 30, color: 'bg-orange-500', badge: 'bg-blue-100 text-blue-700', status: 'Pendente', value: 'R$60' },
                      ].map(({ time, name, service, color, badge, status, value }) => (
                        <div key={name} className="bg-white rounded-xl border border-gray-100 flex items-center gap-3 px-4 py-2.5 hover:shadow-sm transition-shadow">
                          <div className={`w-1.5 h-10 rounded-full ${color} shrink-0`} />
                          <div className="w-10 shrink-0 text-center">
                            <p className="text-xs font-bold text-gray-900">{time}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900">{name}</p>
                            <p className="text-xs text-gray-400">{service}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-gray-900">{value}</p>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${badge}`}>{status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* laptop base */}
            <div className="bg-gray-700 h-4 rounded-b-lg" />
            <div className="bg-gray-600 h-2 rounded-b-xl mx-8" />
          </div>
        </div>
      </section>

      {/* ── PROBLEMA → SOLUÇÃO ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Chega de perder dinheiro assim
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Quem ainda gerencia a agenda pelo WhatsApp enfrenta isso todo dia
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { emoji: '📵', title: 'Respondendo fora do horário', desc: '"Que horário tem?" às 22h. Feriado. Final de semana. Sua vida pessoal virou atendimento 24h.' },
              { emoji: '💸', title: 'Cliente que não aparece', desc: 'Você bloqueou o horário, preparou tudo — e o cliente simplesmente não foi. Dinheiro e tempo no lixo.' },
              { emoji: '😵', title: 'Erro de agenda', desc: 'Caderno, WhatsApp e memória ao mesmo tempo. Uma distração e você marca dois clientes no mesmo horário.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-slate-50 border border-slate-100 rounded-2xl p-7 text-left relative overflow-hidden">
                <div className="text-4xl mb-4">{emoji}</div>
                <h3 className="font-bold text-slate-900 mb-2 text-base">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* arrow */}
          <div className="text-center mb-12">
            <div className="inline-flex flex-col items-center gap-2">
              <div className="w-px h-8 bg-gradient-to-b from-slate-200 to-blue-600" />
              <div className="bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-full">
                Com o AgendaFácil, isso acaba
              </div>
              <div className="w-px h-8 bg-gradient-to-b from-blue-600 to-slate-200" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES — alternating ── */}
      <section id="funcionalidades" className="bg-white pb-6">

        {/* Feature 1 — Agendamento online */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-100">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
                <Smartphone className="h-3.5 w-3.5" />
                Para o seu cliente
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
                Seu cliente marca<br />sozinho, no celular
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Você tem uma página de agendamento profissional com o seu nome. O cliente acessa, escolhe o serviço, o horário e confirma — sem precisar falar com você.
              </p>
              <ul className="space-y-3">
                {[
                  'Funciona 24h, inclusive de madrugada',
                  'Compatível com qualquer celular',
                  'Seu link personalizado: agendafacil.com/seu-nome',
                  'Coloque no Instagram, WhatsApp ou cartão de visita',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 order-1 lg:order-2 flex justify-center">
              <PhoneMockup />
            </div>
          </div>
        </div>

        {/* Feature 2 — Dashboard */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-100">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 flex justify-center">
              <div className="w-full max-w-md bg-slate-50 rounded-2xl border border-slate-100 p-6">
                {/* mini dashboard view */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Sua agenda hoje</p>
                    <p className="text-xs text-slate-400">Quinta, 3 de Abril</p>
                  </div>
                  <div className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">4 clientes</div>
                </div>
                <div className="space-y-2">
                  {[
                    { t: '09:00', n: 'Maria Silva', s: 'Corte + Escova', v: 'R$80', c: 'bg-blue-500' },
                    { t: '10:30', n: 'João Pedro', s: 'Barba completa', v: 'R$50', c: 'bg-purple-500' },
                    { t: '14:00', n: 'Carla Matos', s: 'Manicure', v: 'R$45', c: 'bg-green-500' },
                    { t: '16:00', n: 'Pedro Alves', s: 'Corte masculino', v: 'R$60', c: 'bg-orange-500' },
                  ].map(({ t, n, s, v, c }) => (
                    <div key={t} className="bg-white rounded-xl px-4 py-3 border border-slate-100 flex items-center gap-3">
                      <div className={`w-1.5 h-10 rounded-full ${c} shrink-0`} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-900">{n}</p>
                        <p className="text-xs text-slate-400">{s}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">{v}</p>
                        <p className="text-xs text-slate-400">{t}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                    <p className="text-xs text-slate-400">Receita hoje</p>
                    <p className="text-lg font-extrabold text-slate-900">R$235</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                    <p className="text-xs text-slate-400">No-shows</p>
                    <p className="text-lg font-extrabold text-green-600">0</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
                <BarChart3 className="h-3.5 w-3.5" />
                Para você
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
                Tudo na mesma tela,<br />sem confusão
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Veja todos os agendamentos do dia, a receita acumulada e o histórico de cada cliente — numa interface simples, que funciona no celular e no computador.
              </p>
              <ul className="space-y-3">
                {[
                  'Dashboard com todos os agendamentos do dia',
                  'Histórico completo de cada cliente',
                  'Receita por período em tempo real',
                  'Funciona no celular, tablet e computador',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Feature 3 — Email automático */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-100">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-5">
                <Bell className="h-3.5 w-3.5" />
                Automático
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
                Confirmações e lembretes<br />sem você mover um dedo
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8">
                Assim que o cliente marca, ele já recebe a confirmação por e-mail. Com o plano Pro, ele ainda recebe um lembrete no dia anterior e outro 2 horas antes — eliminando os no-shows.
              </p>
              <ul className="space-y-3">
                {[
                  'Confirmação automática imediata por e-mail',
                  'Lembrete no dia anterior (plano Pro)',
                  'Lembrete 2h antes do horário (plano Pro)',
                  'Zero configuração — funciona sozinho',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 order-1 lg:order-2 flex justify-center">
              {/* email mockup */}
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="font-medium">Caixa de entrada</span>
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">AgendaFácil</p>
                      <p className="text-xs text-slate-400">noreply@agendafacil.com.br</p>
                    </div>
                  </div>
                  <div className="bg-blue-600 rounded-xl p-4 text-white mb-4">
                    <p className="text-xs font-bold mb-1">Agendamento confirmado! ✓</p>
                    <div className="text-xs opacity-90 space-y-1">
                      <p><strong>Serviço:</strong> Corte + Escova</p>
                      <p><strong>Data:</strong> Sexta, 4 de Abril</p>
                      <p><strong>Horário:</strong> 14:00</p>
                      <p><strong>Local:</strong> Salão da Ana Paula</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800">
                    <strong>Lembrete:</strong> Seu horário é amanhã às 14h. Até já!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ativo em 10 minutos</h2>
          <p className="text-slate-400 mb-14 text-lg">Três passos e sua agenda já está funcionando</p>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { step: '01', title: 'Crie sua conta', desc: 'Cadastre-se de graça. Configure seus serviços e horários disponíveis. Tudo simples, sem treinamento.' },
              { step: '02', title: 'Compartilhe seu link', desc: 'Você recebe agendafacil.com/seu-nome. Coloque no Instagram, cartão de visita, grupo do WhatsApp — em qualquer lugar.' },
              { step: '03', title: 'Receba agendamentos', desc: 'Clientes marcam sozinhos. Você recebe a notificação, eles recebem a confirmação. Pronto.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <p className="text-6xl font-black text-slate-700 leading-none mb-4">{step}</p>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-14">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-blue-600/30"
            >
              Criar minha agenda agora
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-slate-500 text-sm mt-3">Sem cartão de crédito</p>
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Preço justo, sem surpresas</h2>
            <p className="text-slate-500 text-lg">Comece grátis. Upgrade só quando precisar.</p>
          </div>

          {/* Trust line */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 mb-12">
            {[
              { icon: ShieldCheck, text: 'Sem taxa de adesão' },
              { icon: Clock, text: 'Cancele quando quiser' },
              { icon: BarChart3, text: 'Sem fidelidade' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-blue-500" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* FREE */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">Grátis</h3>
                <p className="text-slate-400 text-sm mb-6">Para testar sem compromisso</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">R$0</span>
                  <span className="text-slate-400 text-sm">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    { label: '30 agendamentos/mês', ok: true },
                    { label: '1 serviço', ok: true },
                    { label: 'Página de agendamento', ok: true },
                    { label: 'Confirmação por e-mail', ok: true },
                    { label: 'Lembretes automáticos', ok: false },
                    { label: 'Agendamentos ilimitados', ok: false },
                  ].map((f) => (
                    <li key={f.label} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 shrink-0 font-bold text-base leading-none ${f.ok ? 'text-green-500' : 'text-slate-200'}`}>{f.ok ? '✓' : '×'}</span>
                      <span className={f.ok ? 'text-slate-700' : 'text-slate-300'}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/cadastro" className="block text-center border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold py-3 rounded-xl transition-colors mt-auto">
                Começar grátis
              </Link>
              <p className="text-center text-xs text-slate-400 mt-2">Sem cartão de crédito</p>
            </div>

            {/* STARTER */}
            <div className="bg-slate-900 rounded-2xl p-8 relative shadow-2xl flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-5 py-1.5 rounded-full tracking-wide">
                MAIS POPULAR
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white mb-1">Starter</h3>
                <p className="text-slate-400 text-sm mb-6">Para profissionais em crescimento</p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-white">R$39</span>
                  <span className="text-slate-400 text-sm">/mês</span>
                </div>
                <p className="text-green-400 text-xs font-semibold mb-6">Menos que 1 atendimento por mês</p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Até 200 agendamentos/mês',
                    'Serviços ilimitados',
                    'Confirmação por e-mail automática',
                    'Gestão de clientes',
                    'Dashboard de estatísticas',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-green-400 font-bold mt-0.5 shrink-0">✓</span>
                      <span className="text-slate-300">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/cadastro" className="block text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-colors mt-auto shadow-lg shadow-blue-600/30">
                Começar agora
              </Link>
              <p className="text-center text-xs text-slate-500 mt-2">Sem cartão de crédito · Cancele quando quiser</p>
            </div>

            {/* PRO */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">Pro</h3>
                <p className="text-slate-400 text-sm mb-6">Para clínicas e salões que não param</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">R$69</span>
                  <span className="text-slate-400 text-sm">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Agendamentos ilimitados',
                    'Tudo do Starter',
                    'Lembrete e-mail dia anterior',
                    'Lembrete e-mail 2h antes',
                    'Pix integrado',
                    'Analytics avançados',
                    'Suporte prioritário',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/cadastro" className="block text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors mt-auto">
                Assinar Pro
              </Link>
              <p className="text-center text-xs text-slate-400 mt-2">Sem cartão de crédito · Cancele quando quiser</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section id="depoimentos" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Profissionais que transformaram a agenda
            </h2>
            <p className="text-slate-500 text-lg">Resultados reais de quem parou de perder tempo com agendamento manual</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ana Paula S.',
                role: 'Cabeleireira',
                city: 'São Paulo, SP',
                avatar: 'AP',
                bg: 'from-pink-400 to-rose-500',
                text: 'Reduzi meus no-shows quase que completamente. Os lembretes automáticos por e-mail mudaram meu negócio. Não perco mais dinheiro por esquecimento de cliente.',
                result: '↓ 70% no-shows',
              },
              {
                name: 'Dr. Carlos M.',
                role: 'Psicólogo',
                city: 'Belo Horizonte, MG',
                avatar: 'CM',
                bg: 'from-blue-400 to-indigo-500',
                text: 'Meus pacientes adoraram poder marcar consulta pelo celular a qualquer hora. É profissional, simples e confiável. Recomendo para qualquer clínica ou consultório.',
                result: '+30% agendamentos',
              },
              {
                name: 'Fernanda L.',
                role: 'Esteticista',
                city: 'Rio de Janeiro, RJ',
                avatar: 'FL',
                bg: 'from-emerald-400 to-teal-500',
                text: 'Passava 2 horas por dia só respondendo mensagem para marcar horário. Agora é tudo automático. Tenho tempo para focar nos clientes — e na minha vida pessoal.',
                result: '2h/dia economizadas',
              },
            ].map(({ name, role, city, avatar, bg, text, result }) => (
              <div key={name} className="bg-slate-50 border border-slate-100 rounded-2xl p-7 flex flex-col">
                {/* stars */}
                <div className="flex gap-0.5 mb-5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 flex-1">&ldquo;{text}&rdquo;</p>
                {/* result badge */}
                <div className="bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 mb-5 w-fit">
                  <TrendingUp className="h-3 w-3" />
                  {result}
                </div>
                {/* person */}
                <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${bg} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{name}</p>
                    <p className="text-slate-400 text-xs">{role} · {city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-white py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-slate-900 rounded-3xl py-16 px-8 md:px-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Sua agenda cheia começa hoje.
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
              Crie sua conta em 2 minutos e tenha sua página de agendamento funcionando ainda hoje — de graça.
            </p>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-blue-600/40"
            >
              Criar minha agenda grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-slate-400 text-sm">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> Sem cartão de crédito</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> Ativo em 10 minutos</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">AgendaFácil</span>
          </Link>
          <p>© {new Date().getFullYear()} AgendaFácil. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/" className="hover:text-white transition-colors">Para clientes</Link>
            <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
