import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, PLANS, createCheckoutSession } from '@/lib/payments'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checkoutSchema = z.object({
  plan: z.enum(['STARTER', 'PRO']),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  let data: z.infer<typeof checkoutSchema>
  try {
    data = checkoutSchema.parse(body)
  } catch {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 422 })
  }

  const professional = await prisma.professional.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, email: true, name: true },
  })

  if (!professional) {
    return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
  }

  let customerId = professional.stripeCustomerId ?? undefined

  // Create Stripe customer if doesn't exist
  if (!customerId) {
    const stripeCustomer = await stripe.customers.create({
      email: professional.email,
      name: professional.name,
      metadata: { professionalId: session.user.id },
    })
    customerId = stripeCustomer.id

    await prisma.professional.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  const checkoutSession = await createCheckoutSession({
    customerId,
    priceId: PLANS[data.plan as keyof typeof PLANS].priceId,
    professionalId: session.user.id,
    successUrl: `${baseUrl}/assinatura?success=1`,
    cancelUrl: `${baseUrl}/assinatura?cancelled=1`,
  })

  return NextResponse.json({ url: checkoutSession.url })
}
