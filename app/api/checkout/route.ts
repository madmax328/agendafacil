import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession, PLANS } from '@/lib/payments'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { planId } = await req.json()
  const plan = PLANS[planId as keyof typeof PLANS]

  if (!plan) {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
  }

  const professional = await prisma.professional.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

  const checkoutSession = await createCheckoutSession({
    customerId: professional?.stripeCustomerId || undefined,
    priceId: plan.priceId,
    professionalId: session.user.id,
    successUrl: `${baseUrl}/assinatura?success=true`,
    cancelUrl: `${baseUrl}/assinatura?canceled=true`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
