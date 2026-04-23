import Link from 'next/link'
import { Calendar } from 'lucide-react'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://www.markou.app'

export const metadata = {
  title: 'Política de Privacidade | Markou',
  description: 'Como o Markou coleta, usa e protege seus dados pessoais.',
  alternates: { canonical: `${BASE_URL}/privacidade` },
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Markou</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: abril de 2025</p>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Introdução</h2>
            <p>
              O Markou está comprometido com a proteção da privacidade dos seus usuários. Esta
              Política descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais,
              em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Dados que Coletamos</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                <strong>Dados de cadastro:</strong> nome, endereço de e-mail, telefone e informações
                de perfil profissional (tipo de negócio, cidade, estado).
              </li>
              <li>
                <strong>Dados de agendamento:</strong> data, horário, serviço contratado e notas
                fornecidas pelo cliente.
              </li>
              <li>
                <strong>Dados de pagamento:</strong> processados de forma segura via Stripe. O
                Markou não armazena dados de cartão de crédito.
              </li>
              <li>
                <strong>Dados de navegação:</strong> endereço IP, tipo de navegador, páginas visitadas
                e tempo de acesso, coletados para fins analíticos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Finalidade do Tratamento</h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>Prestação e melhoria dos serviços da plataforma.</li>
              <li>Comunicação sobre agendamentos, lembretes e confirmações.</li>
              <li>Envio de notificações transacionais por e-mail e WhatsApp.</li>
              <li>Cumprimento de obrigações legais e regulatórias.</li>
              <li>Prevenção de fraudes e segurança da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Compartilhamento de Dados</h2>
            <p>
              Seus dados não são vendidos a terceiros. Podemos compartilhá-los apenas com:
            </p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>
                <strong>Profissionais cadastrados:</strong> os dados do cliente são compartilhados com
                o profissional para fins de prestação do serviço agendado.
              </li>
              <li>
                <strong>Parceiros tecnológicos:</strong> Stripe (pagamentos), Resend (e-mails) e
                Z-API (WhatsApp), sob acordos de confidencialidade e proteção de dados.
              </li>
              <li>
                <strong>Autoridades competentes:</strong> quando exigido por lei ou decisão judicial.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Retenção dos Dados</h2>
            <p>
              Seus dados são mantidos pelo tempo necessário para a prestação do serviço. Ao solicitar
              a exclusão da conta, seus dados pessoais serão removidos em até 30 dias, exceto quando
              houver obrigação legal de retenção.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo
              criptografia em trânsito (HTTPS/TLS), acesso restrito a dados sensíveis e monitoramento
              contínuo de segurança.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Seus Direitos (LGPD)</h2>
            <p>Conforme a LGPD, você tem direito a:</p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>Confirmar a existência de tratamento de seus dados.</li>
              <li>Acessar seus dados pessoais.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar anonimização, bloqueio ou eliminação de dados.</li>
              <li>Revogar o consentimento dado.</li>
              <li>Solicitar a portabilidade dos dados.</li>
            </ul>
            <p className="mt-3">
              Para exercer seus direitos, entre em contato pelo e-mail:{' '}
              <a href="mailto:privacidade@markou.app" className="text-blue-600 hover:underline">
                privacidade@markou.app
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p>
              Utilizamos cookies essenciais para o funcionamento da plataforma (autenticação de sessão)
              e cookies analíticos para entender como a plataforma é utilizada. Você pode desativar
              cookies não essenciais nas configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Menores de Idade</h2>
            <p>
              O Markou não é direcionado a menores de 18 anos. Não coletamos intencionalmente
              dados de menores. Caso identifiquemos tal situação, os dados serão excluídos imediatamente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Alterações nesta Política</h2>
            <p>
              Esta Política pode ser atualizada periodicamente. Notificaremos os usuários sobre
              mudanças relevantes por e-mail ou aviso na plataforma com antecedência mínima de 15 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Encarregado de Dados (DPO)</h2>
            <p>
              Nosso Encarregado de Proteção de Dados pode ser contatado em:{' '}
              <a href="mailto:privacidade@markou.app" className="text-blue-600 hover:underline">
                privacidade@markou.app
              </a>
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Markou –{' '}
        <Link href="/termos" className="hover:text-gray-600 underline">Termos de Uso</Link>
      </footer>
    </div>
  )
}
