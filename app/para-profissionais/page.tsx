import Link from 'next/link'
import {
  Calendar,
  MessageCircle,
  CreditCard,
  BarChart3,
  Check,
  ArrowRight,
  Star,
  Clock,
  Users,
  Scissors,
  Stethoscope,
  Brain,
} from 'lucide-react'

export const metadata = {
  title: 'AgendaFácil para Profissionais – Sua agenda online em minutos',
  description:
    'Pare de gerenciar sua agenda pelo WhatsApp. Tenha uma página de agendamento online com lembretes automáticos e pagamento Pix integrado.',
}

export default function ParaProfissionaisPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
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
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            Mais de 500 profissionais já usam o AgendaFácil
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Chega de gerenciar
            <br />
            <span className="text-blue-200">agenda pelo WhatsApp</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tenha sua página de agendamento online em minutos. Seus clientes marcam
            horário 24h, você recebe lembretes automáticos e ninguém esquece mais.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              Criar minha agenda grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-blue-200 text-sm">Grátis para sempre • Sem cartão de crédito</p>
          </div>

          {/* Tipos de profissionais */}
          <div className="mt-14 flex flex-wrap justify-center gap-4">
            {[
              { icon: Scissors, label: 'Salão de Beleza' },
              { icon: Stethoscope, label: 'Clínica' },
              { icon: Stethoscope, label: 'Dentista' },
              { icon: Brain, label: 'Psicólogo' },
              { icon: Users, label: 'Personal Trainer' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
                <Icon className="h-4 w-4 text-blue-200" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMA ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Você se reconhece nessa situação?
          </h2>
          <p className="text-gray-500 mb-10">Os maiores problemas de quem gerencia agenda pelo WhatsApp</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: '😤', title: 'Mensagens sem fim', desc: 'Horas por dia respondendo "que horário tem?" no WhatsApp' },
              { emoji: '😱', title: 'Clientes que não aparecem', desc: 'No-shows frequentes que fazem você perder tempo e dinheiro' },
              { emoji: '😰', title: 'Agenda desorganizada', desc: 'Horários marcados em papel, caderno e cabeça — fácil de errar' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ── */}
      <section id="funcionalidades" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Desenvolvido especialmente para profissionais autônomos e pequenas clínicas no Brasil
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                color: 'bg-blue-100 text-blue-600',
                title: 'Agenda Online 24h',
                desc: 'Seus clientes marcam horário a qualquer hora pelo celular, sem precisar falar com você.',
              },
              {
                icon: MessageCircle,
                color: 'bg-green-100 text-green-600',
                title: 'Lembretes pelo WhatsApp',
                desc: 'Lembrete automático 1 dia antes e 2 horas antes do horário. Adeus no-show!',
              },
              {
                icon: CreditCard,
                color: 'bg-purple-100 text-purple-600',
                title: 'Pagamento via Pix',
                desc: 'Aceite pagamentos antecipados via Pix integrado e elimine cancelamentos de última hora.',
              },
              {
                icon: BarChart3,
                color: 'bg-orange-100 text-orange-600',
                title: 'Dashboard completo',
                desc: 'Veja seus agendamentos, receita do mês e taxa de comparecimento em tempo real.',
              },
              {
                icon: Users,
                color: 'bg-pink-100 text-pink-600',
                title: 'Gestão de clientes',
                desc: 'Histórico completo de cada cliente: serviços, agendamentos e anotações.',
              },
              {
                icon: Clock,
                color: 'bg-teal-100 text-teal-600',
                title: 'Disponibilidade flexível',
                desc: 'Configure seus horários por dia da semana. O sistema bloqueia automaticamente.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className={`${color} rounded-xl p-3 h-fit shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Como funciona</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Crie sua conta', desc: 'Cadastre-se em 2 minutos e configure seus serviços e horários disponíveis.' },
              { step: '2', title: 'Compartilhe seu link', desc: 'Envie seu link personalizado (agendafacil.com/seu-nome) para seus clientes pelo WhatsApp.' },
              { step: '3', title: 'Receba agendamentos', desc: 'Os clientes marcam sozinhos e você recebe notificação. Lembretes automáticos cuidam do resto.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Planos e preços</h2>
            <p className="text-gray-500 text-lg">Comece de graça. Upgrade quando precisar.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* FREE */}
            <div className="rounded-2xl border-2 border-gray-200 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Gratuito</h3>
              <p className="text-gray-500 text-sm mb-6">Para testar e começar</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">R$0</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '30 agendamentos/mês',
                  '1 serviço',
                  'Página de agendamento',
                  'Confirmação por e-mail',
                  '❌ Sem lembretes WhatsApp',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${f.startsWith('❌') ? 'text-gray-300' : 'text-green-500'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-colors">
                Começar grátis
              </Link>
            </div>

            {/* STARTER */}
            <div className="rounded-2xl border-2 border-blue-600 p-8 relative shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                MAIS POPULAR
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Starter</h3>
              <p className="text-gray-500 text-sm mb-6">Para profissionais em crescimento</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">R$99</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '200 agendamentos/mês',
                  'Serviços ilimitados',
                  '✅ Confirmação WhatsApp automática',
                  'Gestão de clientes',
                  'Dashboard de estatísticas',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
                Assinar Starter
              </Link>
            </div>

            {/* PRO */}
            <div className="rounded-2xl border-2 border-gray-200 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Pro</h3>
              <p className="text-gray-500 text-sm mb-6">Para clínicas e salões maiores</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">R$199</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Agendamentos ilimitados',
                  'Tudo do Starter',
                  '✅ Confirmação + 2 lembretes WhatsApp',
                  'Pix integrado',
                  'Analytics avançados',
                  'Suporte prioritário',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-colors">
                Assinar Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section id="depoimentos" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            O que dizem nossos clientes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ana Paula S.', role: 'Cabeleireira, São Paulo', text: 'Reduzi meus no-shows em 70%! Os lembretes automáticos no WhatsApp mudaram meu negócio.' },
              { name: 'Dr. Carlos M.', role: 'Psicólogo, Belo Horizonte', text: 'Meus pacientes adoraram poder marcar consulta pelo celular a qualquer hora. Profissional demais!' },
              { name: 'Fernanda L.', role: 'Esteticista, Rio de Janeiro', text: 'Antes eu passava 2 horas por dia no WhatsApp marcando horários. Agora é automático!' },
            ].map(({ name, role, text }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">&quot;{text}&quot;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-blue-600 py-20 text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para simplificar sua agenda?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Crie sua conta grátis hoje e tenha sua página de agendamento funcionando em menos de 10 minutos.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg"
          >
            Criar minha agenda agora
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-4">Grátis para sempre • Sem cartão de crédito • Setup em 10 minutos</p>
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
