import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createBillingPortalSession } from '@/lib/payments'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const professional = await prisma.professional.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })

  if (!professional?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'Nenhuma assinatura ativa encontrada' },
      { status: 400 },
    )
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  const portalSession = await createBillingPortalSession(
    professional.stripeCustomerId,
    `${baseUrl}/assinatura`,
  )

  return NextResponse.json({ url: portalSession.url })
}
