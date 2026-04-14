import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/payments'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  action: z.enum(['cancel', 'reactivate']),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 }) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Ação inválida' }, { status: 422 })

  const professional = await prisma.professional.findUnique({
    where: { id: session.user.id },
    select: { stripeSubscriptionId: true },
  })

  if (!professional?.stripeSubscriptionId) {
    return NextResponse.json({ error: 'Nenhuma assinatura ativa' }, { status: 400 })
  }

  const sub = await stripe.subscriptions.update(professional.stripeSubscriptionId, {
    cancel_at_period_end: parsed.data.action === 'cancel',
  })

  return NextResponse.json({ cancelAtPeriodEnd: sub.cancel_at_period_end })
}
