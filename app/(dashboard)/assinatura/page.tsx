'use client'

import { type ReactNode, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  Loader2,
  CreditCard,
  AlertCircle,
  CalendarClock,
  XCircle,
  RefreshCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── Types ──────────────────────────────────────────────────────────────────────

type PlanId = 'FREE' | 'STARTER' | 'PRO'

interface PlanFeature {
  label: string
  available: boolean
}

interface PlanConfig {
  id: PlanId
  name: string
  price: number | null
  description: string
  icon: ReactNode
  color: string
  badgeColor: string
  buttonColor: string
  features: PlanFeature[]
  highlight?: boolean
}

// ── Plan configs ───────────────────────────────────────────────────────────────

const PLANS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Grátis',
    price: null,
    description: 'Ideal para começar e testar a plataforma.',
    icon: <Sparkles className="h-6 w-6" />,
    color: 'border-gray-200',
    badgeColor: 'bg-gray-100 text-gray-600',
    buttonColor: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    features: [
      { label: 'Até 30 agendamentos/mês', available: true },
      { label: '1 serviço cadastrado', available: true },
      { label: 'Link de agendamento público', available: true },
      { label: 'Painel de controle', available: true },
      { label: 'Confirmação por e-mail', available: true },
      { label: 'Lembretes automáticos por e-mail', available: false },
      { label: 'Múltiplos serviços', available: false },
      { label: 'Pagamento via Pix', available: false },
      { label: 'Relatórios e analytics', available: false },
    ],
  },
  {
    id: 'STARTER',
    name: 'Starter',
    price: 39,
    description: 'Para profissionais que querem crescer com automação.',
    icon: <Zap className="h-6 w-6" />,
    color: 'border-blue-400',
    badgeColor: 'bg-blue-100 text-blue-700',
    buttonColor: 'bg-blue-600 text-white hover:bg-blue-700',
    highlight: true,
    features: [
      { label: 'Até 200 agendamentos/mês', available: true },
      { label: 'Serviços ilimitados', available: true },
      { label: 'Link de agendamento público', available: true },
      { label: 'Painel de controle', available: true },
      { label: 'Confirmação por e-mail', available: true },
      { label: 'Lembretes automáticos por e-mail', available: false },
      { label: 'Múltiplos serviços', available: true },
      { label: 'Pagamento via Pix', available: false },
      { label: 'Relatórios e analytics', available: false },
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 69,
    description: 'Para negócios consolidados que exigem o máximo.',
    icon: <Crown className="h-6 w-6" />,
    color: 'border-purple-400',
    badgeColor: 'bg-purple-100 text-purple-700',
    buttonColor: 'bg-purple-600 text-white hover:bg-purple-700',
    features: [
      { label: 'Agendamentos ilimitados', available: true },
      { label: 'Serviços ilimitados', available: true },
      { label: 'Link de agendamento público', available: true },
      { label: 'Painel de controle', available: true },
      { label: 'Confirmação por e-mail', available: true },
      { label: 'Lembretes automáticos por e-mail (J-1 e H-2)', available: true },
      { label: 'Múltiplos serviços', available: true },
      { label: 'Pagamento via Pix integrado', available: true },
      { label: 'Relatórios e analytics completos', available: true },
    ],
  },
]

// ── Plan Card ──────────────────────────────────────────────────────────────────

function PlanCard({ plan, isCurrentPlan, onUpgrade, loading }: {
  plan: PlanConfig
  isCurrentPlan: boolean
  onUpgrade: (planId: PlanId) => void
  loading: boolean
}) {
  return (
    <div className={`relative flex flex-col rounded-2xl border-2 p-6 transition-shadow ${plan.color} ${plan.highlight ? 'shadow-lg shadow-blue-100' : 'shadow-sm'}`}>
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">Mais popular</span>
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${plan.badgeColor}`}>
          {plan.icon}
        </div>
        {isCurrentPlan && (
          <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">Plano atual</span>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
      <p className="text-sm text-gray-500 mt-1 mb-4">{plan.description}</p>
      <div className="mb-6">
        {plan.price === null ? (
          <span className="text-3xl font-bold text-gray-900">Grátis</span>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-lg text-gray-500 font-medium">R$</span>
            <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
            <span className="text-gray-400 text-sm">/mês</span>
          </div>
        )}
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${feature.available ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Check className={`h-3 w-3 ${feature.available ? 'text-green-600' : 'text-gray-300'}`} />
            </div>
            <span className={`text-sm ${feature.available ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
              {feature.label}
            </span>
          </li>
        ))}
      </ul>
      {isCurrentPlan ? (
        <button disabled className="w-full py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-default">
          Seu plano atual
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onUpgrade(plan.id)}
          disabled={loading}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${plan.buttonColor} disabled:opacity-60 flex items-center justify-center gap-2`}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {plan.price === null ? 'Fazer downgrade' : 'Fazer upgrade'}
        </button>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AssinaturaPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [cancelLoading, setCancelLoading] = useState(false)
  const [subInfo, setSubInfo] = useState<{ cancelAtPeriodEnd: boolean; planExpiresAt: string | null } | null>(null)
  const [subInfoLoading, setSubInfoLoading] = useState(false)

  const currentPlan: PlanId = (session?.user?.plan as PlanId) ?? 'FREE'
  const isPaidPlan = currentPlan === 'STARTER' || currentPlan === 'PRO'
  const currentPlanConfig = PLANS.find((p) => p.id === currentPlan)!

  useEffect(() => {
    if (!isPaidPlan) return
    setSubInfoLoading(true)
    fetch('/api/payments/subscription')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setSubInfo(d) })
      .finally(() => setSubInfoLoading(false))
  }, [isPaidPlan])

  function handleUpgrade(planId: PlanId) {
    if (planId === 'FREE') return
    router.push(`/assinar/${planId.toLowerCase()}`)
  }

  async function handleCancelToggle() {
    if (!subInfo) return
    const action = subInfo.cancelAtPeriodEnd ? 'reactivate' : 'cancel'
    setCancelLoading(true)
    try {
      const res = await fetch('/api/payments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSubInfo(prev => prev ? { ...prev, cancelAtPeriodEnd: data.cancelAtPeriodEnd } : prev)
      toast({
        title: action === 'cancel'
          ? 'Assinatura cancelada ao final do período'
          : 'Assinatura reativada',
      })
    } catch {
      toast({ title: 'Erro ao atualizar assinatura', variant: 'destructive' })
    } finally {
      setCancelLoading(false)
    }
  }

  const nextBillingDate = subInfo?.planExpiresAt
    ? format(parseISO(subInfo.planExpiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : (session?.user?.planExpiresAt
        ? format(parseISO(session.user.planExpiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
        : null)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assinatura</h1>
        <p className="text-sm text-gray-500 mt-1">Escolha o plano ideal para o seu negócio</p>
      </div>

      {/* Current plan banner */}
      <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentPlanConfig.badgeColor}`}>
            {currentPlanConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">Plano atual</p>
            <p className="text-lg font-bold text-gray-900">
              {currentPlanConfig.name}
              {currentPlanConfig.price && (
                <span className="text-sm font-normal text-gray-500 ml-2">— R$ {currentPlanConfig.price}/mês</span>
              )}
            </p>

            {/* Billing details */}
            {isPaidPlan && (
              <div className="mt-3 space-y-2">
                {subInfoLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Carregando dados da assinatura...
                  </div>
                ) : (
                  <>
                    {nextBillingDate && (
                      <div className={`flex items-center gap-2 text-sm ${subInfo?.cancelAtPeriodEnd ? 'text-red-600' : 'text-gray-600'}`}>
                        {subInfo?.cancelAtPeriodEnd ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                            <span>Acesso até <strong>{nextBillingDate}</strong> — cancelamento agendado</span>
                          </>
                        ) : (
                          <>
                            <CalendarClock className="h-4 w-4 text-blue-500 shrink-0" />
                            <span>Próxima cobrança em <strong>{nextBillingDate}</strong></span>
                          </>
                        )}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelToggle}
                      disabled={cancelLoading}
                      className={`gap-2 mt-1 ${subInfo?.cancelAtPeriodEnd ? 'border-green-300 text-green-700 hover:bg-green-50' : 'border-red-200 text-red-600 hover:bg-red-50'}`}
                    >
                      {cancelLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : subInfo?.cancelAtPeriodEnd ? (
                        <RefreshCcw className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      {subInfo?.cancelAtPeriodEnd ? 'Reativar assinatura' : 'Cancelar assinatura'}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Manage payment method */}
          {isPaidPlan && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const res = await fetch('/api/payments/portal', { method: 'POST' })
                  if (!res.ok) throw new Error()
                  const { url } = await res.json()
                  if (url) window.location.href = url
                } catch {
                  toast({ title: 'Erro ao abrir portal de pagamento', variant: 'destructive' })
                }
              }}
              className="gap-2 self-start shrink-0"
            >
              <CreditCard className="h-4 w-4" />
              Alterar cartão
            </Button>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlan === plan.id}
            onUpgrade={handleUpgrade}
            loading={false}
          />
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Perguntas frequentes</h3>
        <div className="space-y-4">
          {[
            {
              q: 'Posso cancelar a qualquer momento?',
              a: 'Sim. O cancelamento é agendado para o final do período já pago — você mantém acesso até lá.',
            },
            {
              q: 'O que acontece se eu ultrapassar o limite do plano Grátis?',
              a: 'Novos agendamentos serão bloqueados até o início do mês seguinte ou até você fazer upgrade.',
            },
            {
              q: 'Como funciona o pagamento?',
              a: 'O pagamento é processado de forma segura via Stripe. Aceitamos cartões de crédito e débito das principais bandeiras.',
            },
            {
              q: 'Posso mudar de plano a qualquer momento?',
              a: 'Sim. Upgrades têm efeito imediato (com cobrança proporcional). Downgrades entram em vigor no próximo ciclo.',
            },
          ].map(({ q, a }, i) => (
            <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <p className="text-sm font-semibold text-gray-900">{q}</p>
              <p className="text-sm text-gray-500 mt-1">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
