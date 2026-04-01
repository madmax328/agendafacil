import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const professional = await prisma.professional.findUnique({
    where: { id: session.user.id },
    select: { zapiInstanceId: true, whatsappToken: true, zapiClientToken: true },
  })

  const instanceId = professional?.zapiInstanceId?.trim()
  const instanceToken = professional?.whatsappToken?.trim()
  // Client-Token (Security Token) — falls back to instance token if not set separately
  const clientToken = professional?.zapiClientToken?.trim() || instanceToken

  if (!instanceId || !instanceToken) {
    return NextResponse.json({
      connected: false,
      reason: 'Credenciais não configuradas. Preencha o ID da instância, o Token e o Client-Token, depois salve.',
    })
  }

  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${instanceToken}/status`,
      {
        headers: { 'Client-Token': clientToken ?? '' },
        signal: AbortSignal.timeout(8000),
      },
    )

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({
        connected: false,
        reason: `Erro Z-API ${res.status}: ${text || 'resposta inválida'}`,
      })
    }

    const data = await res.json()
    return NextResponse.json({
      connected: data.connected === true,
      session: data.session ?? null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ connected: false, reason: message })
  }
}
