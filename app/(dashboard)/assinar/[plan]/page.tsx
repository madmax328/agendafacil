'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { Check, Zap, Crown, ShieldCheck, Lock, ArrowLeft, Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Plan config ────────────────────────────────────────────────────────────────

const PLAN_CONFIGS = {
  STARTER: {
    name: 'Starter',
    price: 39,
    icon: <Zap className="h-6 w-6" />,
    color: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-400',
    features: [
      'Até 200 agendamentos/mês',
      'Serviços ilimitados',
      'Link de agendamento público',
      'Painel de controle',
      'Confirmação por e-mail automática',
      'Suporte por e-mail',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 69,
    icon: <Crown className="h-6 w-6" />,
    color: 'text-purple-600',
    badgeColor: 'bg-purple-100 text-purple-700',
    borderColor: 'border-purple-400',
    features: [
      'Agendamentos ilimitados',
      'Serviços ilimitados',
      'Link de agendamento público',
      'Painel de controle',
      'Confirmação por e-mail automática',
      'Lembretes automáticos por e-mail (J-1 e H-2)',
      'Pagamento via Pix integrado',
      'Relatórios e analytics completos',
      'Suporte prioritário',
    ],
  },
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AssinarPage() {
  const params = useParams()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState(false)

  const planKey = (params.plan as string)?.toUpperCase() as keyof typeof PLAN_CONFIGS
  const plan = PLAN_CONFIGS[planKey]

  const fetchClientSecret = useCallback(async () => {
    try {
      const res = await fetch('/api/payments/checkout-embedded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      if (!res.ok) throw new Error('Failed to create checkout session')
      const { clientSecret: secret } = await res.json()
      setClientSecret(secret)
    } catch {
      setFetchError(true)
    }
  }, [planKey])

  useEffect(() => {
    if (plan) {
      fetchClientSecret()
    }
  }, [plan, fetchClientSecret])

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Plano não encontrado.</p>
        <button
          onClick={() => router.push('/assinatura')}
          className="mt-4 text-blue-600 text-sm underline"
        >
          Voltar para planos
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Back link */}
        <button
          onClick={() => router.push('/assinatura')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para planos
        </button>

        {/* Plan summary header */}
        <div className={`bg-white rounded-2xl border-2 ${plan.borderColor} p-6 shadow-sm mb-6`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.badgeColor}`}>
              {plan.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Plano {plan.name}</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-sm text-gray-400">R$</span>
                <span className="text-2xl font-extrabold text-gray-900">{plan.price}</span>
                <span className="text-sm text-gray-400">/mês</span>
              </div>
            </div>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-700">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                {feature}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              Pagamento processado com segurança via Stripe
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Cancele a qualquer momento, sem burocracia
            </div>
          </div>
        </div>

        {/* Embedded Checkout */}
        {fetchError ? (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
            <p className="text-red-600 font-semibold mb-2">Erro ao carregar o checkout</p>
            <p className="text-gray-500 text-sm mb-4">Não foi possível iniciar o pagamento. Tente novamente.</p>
            <button
              onClick={() => {
                setFetchError(false)
                fetchClientSecret()
              }}
              className="text-sm text-blue-600 underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : !clientSecret ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Carregando checkout seguro...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </div>
  )
}
