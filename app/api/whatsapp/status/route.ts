import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Read credentials from the professional's own profile
  const professional = await prisma.professional.findUnique({
    where: { id: session.user.id },
    select: { zapiInstanceId: true, whatsappToken: true },
  })

  const instanceId = professional?.zapiInstanceId
  const token = professional?.whatsappToken

  if (!instanceId || !token) {
    return NextResponse.json({
      connected: false,
      reason: 'Credenciais não configuradas. Salve o ID da instância e o Token primeiro.',
    })
  }

  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
      {
        headers: { 'Client-Token': token },
        signal: AbortSignal.timeout(8000),
      },
    )

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({
        connected: false,
        reason: `Erro Z-API: ${res.status}${text ? ' – ' + text : ''}`,
      })
    }

    const data = await res.json()
    // Z-API returns { connected: boolean, session: string, ... }
    return NextResponse.json({
      connected: data.connected === true,
      session: data.session ?? null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ connected: false, reason: message })
  }
}
