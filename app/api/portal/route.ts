import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createBillingPortalSession } from '@/lib/payments'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const professional = await prisma.professional.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })

  if (!professional?.stripeCustomerId) {
    return NextResponse.json({ error: 'Sem assinatura ativa' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
  const portalSession = await createBillingPortalSession(
    professional.stripeCustomerId,
    `${baseUrl}/assinatura`
  )

  return NextResponse.json({ url: portalSession.url })
}
