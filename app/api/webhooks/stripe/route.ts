import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/payments'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const professionalId = session.metadata?.professionalId

      if (professionalId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'PRO' : 'STARTER'

        await prisma.professional.update({
          where: { id: professionalId },
          data: {
            plan: plan as any,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            planExpiresAt: new Date(subscription.current_period_end * 1000),
          },
        })
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const priceId = subscription.items.data[0]?.price.id
      const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'PRO' : 'STARTER'

      await prisma.professional.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan: plan as any,
          planExpiresAt: new Date(subscription.current_period_end * 1000),
        },
      })
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      await prisma.professional.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan: 'FREE',
          stripeSubscriptionId: null,
          planExpiresAt: null,
        },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
