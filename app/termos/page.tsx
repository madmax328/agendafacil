import Link from 'next/link'
import { Calendar } from 'lucide-react'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://www.markou.app'

export const metadata = {
  title: 'Termos de Uso | Markou',
  description: 'Termos e condições de uso da plataforma Markou.',
  alternates: { canonical: `${BASE_URL}/termos` },
}

export default function TermosPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: abril de 2025</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar ou utilizar a plataforma Markou ("Serviço"), você concorda com estes
              Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá
              utilizar o Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h2>
            <p>
              O Markou é uma plataforma de agendamento online que permite a profissionais de saúde
              e beleza gerenciar sua agenda, clientes e pagamentos. Clientes podem encontrar e agendar
              serviços com profissionais cadastrados na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Cadastro e Conta</h2>
            <p>
              Para utilizar o Serviço como profissional, é necessário criar uma conta com informações
              verídicas e atualizadas. Você é responsável por manter a confidencialidade de suas
              credenciais de acesso e por todas as atividades realizadas em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Planos e Pagamentos</h2>
            <p>
              O Markou oferece planos gratuitos e pagos. Os planos pagos são cobrados mensalmente
              via cartão de crédito ou débito. O cancelamento pode ser feito a qualquer momento, sem
              multa, e o acesso ao plano pago é mantido até o fim do período contratado.
            </p>
            <p className="mt-2">
              Os preços dos planos podem ser alterados com aviso prévio de 30 dias por e-mail.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Responsabilidades do Profissional</h2>
            <p>
              O profissional cadastrado é o único responsável pelos serviços prestados, pela veracidade
              das informações divulgadas em seu perfil e pelo cumprimento dos agendamentos realizados
              através da plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Responsabilidades dos Clientes</h2>
            <p>
              O cliente é responsável pelas informações fornecidas no momento do agendamento e pelo
              comparecimento aos horários marcados. O cancelamento deve ser feito com antecedência
              mínima conforme definido pelo profissional.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da plataforma Markou — incluindo textos, logotipos, interfaces e
              código-fonte — é de propriedade exclusiva do Markou e protegido pelas leis de
              propriedade intelectual brasileiras.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Limitação de Responsabilidade</h2>
            <p>
              O Markou atua como intermediador tecnológico e não se responsabiliza pela qualidade
              dos serviços prestados pelos profissionais, por cancelamentos, divergências ou quaisquer
              danos decorrentes da relação entre profissional e cliente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Privacidade</h2>
            <p>
              O tratamento de dados pessoais é realizado conforme nossa{' '}
              <Link href="/privacidade" className="text-blue-600 hover:underline">
                Política de Privacidade
              </Link>
              , em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Modificações dos Termos</h2>
            <p>
              O Markou reserva-se o direito de modificar estes Termos a qualquer momento. As
              alterações entrarão em vigor após publicação na plataforma e notificação por e-mail.
              O uso continuado do Serviço após as alterações implica concordância com os novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Lei Aplicável</h2>
            <p>
              Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de
              São Paulo – SP para dirimir quaisquer controvérsias decorrentes deste instrumento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes Termos, entre em contato pelo e-mail:{' '}
              <a href="mailto:suporte@markou.app" className="text-blue-600 hover:underline">
                suporte@markou.app
              </a>
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Markou –{' '}
        <Link href="/privacidade" className="hover:text-gray-600 underline">Política de Privacidade</Link>
      </footer>
    </div>
  )
}
