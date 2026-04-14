import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/payments'
import { prisma } from '@/lib/prisma'

// Must read raw body for Stripe signature verification
export const dynamic = 'force-dynamic'

// Map Stripe price ID → Plan enum
function priceIdToPlan(priceId: string): 'STARTER' | 'PRO' | null {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'STARTER'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO'
  return null
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('[Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      // ── Payment completed (first subscription) ──────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const professionalId = session.metadata?.professionalId
        const subscriptionId = session.subscription as string

        if (!professionalId || !subscriptionId) break

        // Fetch subscription to get price ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
          expand: ['items.data.price'],
        })
        const priceId = subscription.items.data[0]?.price?.id
        const plan = priceIdToPlan(priceId)

        if (!plan) {
          console.error('[Webhook] Unknown price ID:', priceId)
          break
        }

        await prisma.professional.update({
          where: { id: professionalId },
          data: {
            plan,
            stripeSubscriptionId: subscriptionId,
            planExpiresAt: new Date(subscription.current_period_end * 1000),
          },
        })

        console.log(`[Webhook] Plan updated: ${professionalId} → ${plan}`)
        break
      }

      // ── Subscription updated (upgrade / downgrade / renewal) ───────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const professional = await prisma.professional.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!professional) break

        const priceId = subscription.items.data[0]?.price?.id
        const plan = priceIdToPlan(priceId)

        if (!plan) break

        await prisma.professional.update({
          where: { id: professional.id },
          data: {
            plan,
            stripeSubscriptionId: subscription.id,
            planExpiresAt: new Date(subscription.current_period_end * 1000),
          },
        })

        console.log(`[Webhook] Subscription updated: ${professional.id} → ${plan}`)
        break
      }

      // ── Subscription cancelled ─────────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const professional = await prisma.professional.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!professional) break

        await prisma.professional.update({
          where: { id: professional.id },
          data: {
            plan: 'FREE',
            stripeSubscriptionId: null,
            planExpiresAt: null,
          },
        })

        console.log(`[Webhook] Subscription cancelled: ${professional.id} → FREE`)
        break
      }

      // ── Recurring payment succeeded ────────────────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (!invoice.subscription) break

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
          { expand: ['items.data.price'] },
        )

        const customerId = subscription.customer as string
        const professional = await prisma.professional.findFirst({
          where: { stripeCustomerId: customerId },
        })
        if (!professional) break

        // Extend expiry on each successful renewal
        await prisma.professional.update({
          where: { id: professional.id },
          data: {
            planExpiresAt: new Date(subscription.current_period_end * 1000),
          },
        })

        console.log(`[Webhook] Invoice paid, expiry extended: ${professional.id}`)
        break
      }

      default:
        // Ignore other events
        break
    }
  } catch (err) {
    console.error('[Webhook] Handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
