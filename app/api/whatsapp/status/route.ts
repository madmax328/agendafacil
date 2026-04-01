import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim()
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()
  const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER?.trim()

  if (!accountSid || !authToken || !whatsappNumber) {
    return NextResponse.json({
      connected: false,
      reason: 'Twilio não configurado no servidor (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_NUMBER).',
    })
  }

  // Validate credentials by calling Twilio's account endpoint
  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        headers: { Authorization: `Basic ${credentials}` },
        signal: AbortSignal.timeout(8000),
      },
    )

    if (!res.ok) {
      return NextResponse.json({
        connected: false,
        reason: `Credenciais Twilio inválidas (HTTP ${res.status})`,
      })
    }

    const data = await res.json()
    return NextResponse.json({
      connected: true,
      accountName: data.friendly_name ?? accountSid,
      whatsappNumber,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ connected: false, reason: message })
  }
}
