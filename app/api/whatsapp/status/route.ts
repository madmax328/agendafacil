import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const instanceId = process.env.ZAPI_INSTANCE_ID
  const token = process.env.ZAPI_TOKEN

  if (!instanceId || !token) {
    return NextResponse.json({ connected: false, reason: 'Credenciais não configuradas' })
  }

  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/status`,
      {
        headers: { 'Client-Token': token },
        // Short timeout to avoid blocking the UI
        signal: AbortSignal.timeout(5000),
      },
    )

    if (!res.ok) {
      return NextResponse.json({ connected: false, reason: 'Erro na API Z-API' })
    }

    const data = await res.json()
    // Z-API returns { connected: boolean, session: string }
    return NextResponse.json({ connected: data.connected === true })
  } catch {
    return NextResponse.json({ connected: false, reason: 'Timeout ou erro de rede' })
  }
}
