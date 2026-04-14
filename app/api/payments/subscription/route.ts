import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/payments'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const professional = await prisma.professional.findUnique({
    where: { id: session.user.id },
    select: { stripeSubscriptionId: true, planExpiresAt: true, plan: true },
  })

  if (!professional?.stripeSubscriptionId) {
    return NextResponse.json({ cancelAtPeriodEnd: false, planExpiresAt: professional?.planExpiresAt ?? null })
  }

  try {
    const sub = await stripe.subscriptions.retrieve(professional.stripeSubscriptionId)
    return NextResponse.json({
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      planExpiresAt: professional.planExpiresAt,
    })
  } catch {
    return NextResponse.json({ cancelAtPeriodEnd: false, planExpiresAt: professional.planExpiresAt })
  }
}
