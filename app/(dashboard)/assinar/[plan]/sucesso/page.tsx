'use client'

import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const PLAN_CONFIGS = {
  starter: {
    name: 'Starter',
    price: 39,
    color: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  pro: {
    name: 'Pro',
    price: 69,
    color: 'text-purple-600',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
}

export default function SuccessPage() {
  const params = useParams()
  const planKey = (params.plan as string)?.toLowerCase() as keyof typeof PLAN_CONFIGS
  const plan = PLAN_CONFIGS[planKey]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        {/* Green checkmark */}
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
          Pagamento confirmado!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Sua assinatura foi ativada com sucesso. Bem-vindo ao Markou!
        </p>

        {plan && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
              Plano ativo
            </p>
            <div className="flex items-center justify-between">
              <span className={`font-bold text-lg ${plan.color}`}>Plano {plan.name}</span>
              <span className="text-sm font-semibold text-gray-700">
                R$ {plan.price}/mês
              </span>
            </div>
          </div>
        )}

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm transition-colors"
        >
          Ir para o dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
