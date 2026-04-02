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
  Scissors,
  Stethoscope,
  Brain,
  Mail,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react'

export const metadata = {
  title: 'AgendaFácil para Profissionais – Sua agenda online em minutos',
  description:
    'Adeus no-show. Sua página de agendamento online em 10 minutos. Clientes marcam sozinhos, confirmações automáticas, zero papel.',
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
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center relative">

          {/* Social proof badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            Já são +500 profissionais organizados com o AgendaFácil
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Adeus no-show.
            <br />
            <span className="text-blue-200">Olá, agenda cheia.</span>
          </h1>

          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-4 leading-relaxed">
            Seus clientes marcam horário sozinhos 24h por dia. Eles recebem confirmação por e-mail automaticamente. Você para de perder tempo e dinheiro.
          </p>

          <p className="text-blue-300 text-sm mb-10 font-medium">
            Ativo em menos de 10 minutos • Sem cartão de crédito
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2 shadow-xl"
            >
              Criar minha agenda grátis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#planos"
              className="w-full sm:w-auto border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
            >
              Ver planos
            </Link>
          </div>

          {/* Tipos de negócio */}
          <div className="mt-14 flex flex-wrap justify-center gap-3">
            {[
              { icon: Scissors, label: 'Salão de Beleza' },
              { icon: Scissors, label: 'Barbearia' },
              { icon: Stethoscope, label: 'Clínica' },
              { icon: Stethoscope, label: 'Dentista' },
              { icon: Brain, label: 'Psicólogo' },
              { icon: Users, label: 'Personal Trainer' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-2 text-sm">
                <Icon className="h-3.5 w-3.5 text-blue-200" />
                <span className="text-blue-100">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NÚMEROS ── */}
      <section className="border-b border-gray-100 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '+500', label: 'profissionais ativos' },
              { number: '70%', label: 'menos no-shows' },
              { number: '10min', label: 'para ativar sua agenda' },
              { number: '24h', label: 'seus clientes podem marcar' },
            ].map(({ number, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-blue-600">{number}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMA ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Você tá esperando o quê?
          </h2>
          <p className="text-gray-500 mb-12 text-lg">Isso acontece todo dia com quem gerencia agenda pelo WhatsApp</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: '😤', title: 'Respondendo o dia todo', desc: '"Que horário tem?" às 22h. Fim de semana. Feriado. Sua vida pessoal virou atendimento.' },
              { emoji: '😱', title: 'Cliente que não aparece', desc: 'Você reservou o horário, preparou tudo — e o cliente simplesmente não veio. Dinheiro no lixo.' },
              { emoji: '😰', title: 'Agenda no papel', desc: 'Caderno, WhatsApp e cabeça ao mesmo tempo. Um erro e você double-boca dois clientes.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-red-50 border border-red-100 rounded-2xl p-6 text-left">
                <div className="text-3xl mb-3">{emoji}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUÇÃO / FUNCIONALIDADES ── */}
      <section id="funcionalidades" className="bg-blue-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sua agenda trabalha enquanto você atende
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Feito para profissionais brasileiros. Simples, rápido e sem complicação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                color: 'bg-blue-100 text-blue-600',
                title: 'Clientes que marcam sozinhos',
                desc: 'Sua página de agendamento funciona 24h. O cliente escolhe o horário, você recebe a notificação — sem trocar uma mensagem.',
              },
              {
                icon: Mail,
                color: 'bg-green-100 text-green-600',
                title: 'Confirmação que chega na hora',
                desc: 'Assim que o cliente marca, ele recebe um e-mail de confirmação automático. Ninguém esquece, ninguém falta.',
              },
              {
                icon: TrendingUp,
                color: 'bg-purple-100 text-purple-600',
                title: 'Agenda cheia, não cabeça cheia',
                desc: 'Veja todos os agendamentos do dia numa tela só. Sem papel, sem WhatsApp, sem stress.',
              },
              {
                icon: CreditCard,
                color: 'bg-orange-100 text-orange-600',
                title: 'Receba antes pelo Pix',
                desc: 'Exija pagamento antecipado e acabe de vez com cancelamentos de última hora. Seu tempo tem valor.',
              },
              {
                icon: Users,
                color: 'bg-pink-100 text-pink-600',
                title: 'Histórico completo dos clientes',
                desc: 'Veja tudo que cada cliente já fez com você. Serviços, datas, observações — tudo num lugar só.',
              },
              {
                icon: Clock,
                color: 'bg-teal-100 text-teal-600',
                title: 'Você decide quando atende',
                desc: 'Configure seus horários por dia da semana. O sistema bloqueia o que estiver ocupado automaticamente.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 flex gap-4">
                <div className={`${color} rounded-xl p-3 h-fit shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ativo em 10 minutos</h2>
          <p className="text-gray-500 mb-12">Três passos e sua agenda já está funcionando</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Crie sua conta', desc: 'Cadastre-se gratuitamente. Configure seus serviços e horários em menos de 10 minutos.' },
              { step: '2', title: 'Compartilhe seu link', desc: 'Envie agendafacil.com/seu-nome para seus clientes. Pode colocar no Instagram, cartão de visita, onde quiser.' },
              { step: '3', title: 'Receba agendamentos', desc: 'Os clientes marcam sozinhos. Confirmação automática por e-mail. Você só aparece para atender.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center relative">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-blue-200">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ── */}
      <section id="planos" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Preço justo, sem surpresas</h2>
            <p className="text-gray-500 text-lg">Comece grátis. Upgrade só quando precisar.</p>
          </div>

          {/* Trust line */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-12">
            {[
              { icon: ShieldCheck, text: 'Sem taxa de adesão' },
              { icon: Zap, text: 'Cancele quando quiser' },
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
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Grátis</h3>
                <p className="text-gray-500 text-sm mb-6">Para testar sem compromisso</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">R$0</span>
                  <span className="text-gray-400">/mês</span>
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
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${f.ok ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className={f.ok ? 'text-gray-700' : 'text-gray-400 line-through'}>{f.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/cadastro" className="block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-colors mt-auto">
                Começar grátis
              </Link>
              <p className="text-center text-xs text-gray-400 mt-2">Sem cartão de crédito</p>
            </div>

            {/* STARTER */}
            <div className="bg-white rounded-2xl border-2 border-blue-600 p-8 relative shadow-xl flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-5 py-1.5 rounded-full">
                MAIS POPULAR
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Starter</h3>
                <p className="text-gray-500 text-sm mb-6">Para profissionais em crescimento</p>
                <div className="mb-1">
                  <span className="text-4xl font-bold text-gray-900">R$39</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <p className="text-green-600 text-xs font-medium mb-6">Menos que 1 atendimento por mês</p>
                <ul className="space-y-3 mb-8">
                  {[
                    'Até 200 agendamentos/mês',
                    'Serviços ilimitados',
                    'Confirmação por e-mail automática',
                    'Gestão de clientes',
                    'Dashboard de estatísticas',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/cadastro" className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors mt-auto">
                Começar agora
              </Link>
              <p className="text-center text-xs text-gray-400 mt-2">Sem cartão de crédito · Cancele quando quiser</p>
            </div>

            {/* PRO */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pro</h3>
                <p className="text-gray-500 text-sm mb-6">Para clínicas e salões que não param</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">R$69</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Agendamentos ilimitados',
                    'Tudo do Starter',
                    'Lembrete e-mail dia anterior (J-1)',
                    'Lembrete e-mail 2h antes (H-2)',
                    'Pix integrado',
                    'Analytics avançados',
                    'Suporte prioritário',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/cadastro" className="block text-center border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-colors mt-auto">
                Assinar Pro
              </Link>
              <p className="text-center text-xs text-gray-400 mt-2">Sem cartão de crédito · Cancele quando quiser</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section id="depoimentos" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            O que dizem os profissionais
          </h2>
          <p className="text-gray-500 text-center mb-12">Resultados reais de quem já largou a agenda no papel</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ana Paula S.', role: 'Cabeleireira, São Paulo', text: 'Reduzi meus no-shows em 70%! Os lembretes automáticos por e-mail mudaram meu negócio. Não perco mais dinheiro por esquecimento.' },
              { name: 'Dr. Carlos M.', role: 'Psicólogo, Belo Horizonte', text: 'Meus pacientes adoraram poder marcar consulta pelo celular a qualquer hora. Profissional demais. Recomendo para qualquer clínica.' },
              { name: 'Fernanda L.', role: 'Esteticista, Rio de Janeiro', text: 'Antes eu passava 2 horas por dia respondendo mensagem para marcar horário. Agora é tudo automático. Tenho minha vida de volta!' },
            ].map(({ name, role, text }) => (
              <div key={name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex mb-4">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">&quot;{text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-20 text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sua agenda já pode estar cheia amanhã.
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            Crie sua conta em 2 minutos e tenha sua página de agendamento funcionando hoje.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-xl"
          >
            Criar minha agenda grátis
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-blue-200 text-sm mt-4">
            Grátis para sempre · Sem cartão de crédito · Ativo em 10 minutos
          </p>
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
