import Link from 'next/link'
import { MailCheck, ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Verifique seu e-mail',
}

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="bg-white/20 rounded-xl p-2">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                AgendaFácil
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-10 text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="bg-blue-50 rounded-full p-5 ring-8 ring-blue-50">
                <MailCheck className="h-12 w-12 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Verifique seu e-mail
              </h1>
              <p className="text-gray-500 leading-relaxed">
                Enviamos um link de acesso para o seu endereço de e-mail.
                <br />
                Clique no link para entrar na sua conta.
              </p>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-left space-y-2">
              <p className="text-sm font-semibold text-blue-800">
                Não recebeu o e-mail?
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Verifique a pasta de spam ou lixo eletrônico</li>
                <li>Aguarde alguns minutos e recarregue a página</li>
                <li>Certifique-se de ter digitado o e-mail corretamente</li>
              </ul>
            </div>

            {/* Security note */}
            <p className="text-xs text-gray-400">
              Por segurança, o link expira em{' '}
              <span className="font-semibold text-gray-500">24 horas</span>.
              Não compartilhe este link com ninguém.
            </p>

            {/* Back to login */}
            <Button
              variant="outline"
              className="w-full h-11 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              asChild
            >
              <Link href="/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para o login
              </Link>
            </Button>
          </div>
        </div>

        {/* Help note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Precisa de ajuda?{' '}
          <a
            href="mailto:suporte@agendafacil.com.br"
            className="text-blue-600 hover:underline font-medium"
          >
            Fale com nosso suporte
          </a>
        </p>
      </div>
    </div>
  )
}
