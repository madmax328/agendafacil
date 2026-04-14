'use client'

import { useState, useTransition } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Check,
  Zap,
  Crown,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Loader2,
  CreditCard,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// ── Plan config ────────────────────────────────────────────────────────────────

const PLAN_CONFIGS = {
  STARTER: {
    name: 'Starter',
    price: 39,
    icon: <Zap className="h-6 w-6" />,
    color: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-400',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
    shadowColor: 'shadow-blue-100',
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
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    shadowColor: 'shadow-purple-100',
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
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  const planKey = (params.plan as string)?.toUpperCase() as keyof typeof PLAN_CONFIGS
  const plan = PLAN_CONFIGS[planKey]

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

  function handleCheckout() {
    setIsLoading(true)
    startTransition(async () => {
      try {
        const res = await fetch('/api/payments/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: planKey }),
        })
        if (!res.ok) throw new Error()
        const { url } = await res.json()
        if (url) window.location.href = url
      } catch {
        toast({ title: 'Erro ao processar pagamento. Tente novamente.', variant: 'destructive' })
        setIsLoading(false)
      }
    })
  }

  const loading = isLoading || isPending

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back link */}
        <button
          onClick={() => router.push('/assinatura')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para planos
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Assinatura Markou</p>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Você está assinando o plano{' '}
            <span className={plan.color}>{plan.name}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Confirme os detalhes abaixo antes de prosseguir para o pagamento seguro.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Plan summary card */}
          <div className={`md:col-span-3 bg-white rounded-2xl border-2 ${plan.borderColor} p-6 shadow-sm`}>
            <div className="flex items-center gap-3 mb-5">
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

            <ul className="space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment details card */}
          <div className="md:col-span-2 space-y-4">
            {/* Account info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Conta
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session?.user?.name ?? 'Usuário'}
              </p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Resumo
              </p>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Plano {plan.name}</span>
                <span className="font-semibold text-gray-900">R$ {plan.price}/mês</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-2 mt-2">
                <span className="font-semibold text-gray-700">Total hoje</span>
                <span className="font-bold text-gray-900">R$ {plan.price}</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">Renovação automática mensal. Cancele quando quiser.</p>
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className={`w-full py-4 rounded-2xl text-white font-bold transition-all ${plan.buttonColor} disabled:opacity-60 flex items-center justify-center gap-2 text-sm shadow-lg ${plan.shadowColor}`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {loading ? 'Redirecionando...' : 'Pagar com segurança'}
            </button>

            {/* Trust badges */}
            <div className="flex flex-col gap-2">
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
        </div>
      </div>
    </div>
  )
}
