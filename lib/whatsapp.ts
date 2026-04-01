// Integração centralizada com Twilio WhatsApp Business API
// Variáveis de ambiente necessárias:
//   TWILIO_ACCOUNT_SID   — Account SID (começa com AC)
//   TWILIO_AUTH_TOKEN    — Auth Token
//   TWILIO_WHATSAPP_NUMBER — Número aprovado, ex: whatsapp:+14155238886

import twilio from 'twilio'

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) return null
  return twilio(accountSid, authToken)
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`
  return `whatsapp:+${withCountry}`
}

export async function sendWhatsAppMessage({
  phone,
  message,
}: {
  phone: string
  message: string
}): Promise<boolean> {
  const client = getClient()
  const from = process.env.TWILIO_WHATSAPP_NUMBER

  if (!client || !from) {
    console.warn('[WhatsApp] Twilio não configurado (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_NUMBER)')
    return false
  }

  try {
    await client.messages.create({
      from,
      to: formatPhone(phone),
      body: message,
    })
    return true
  } catch (error) {
    console.error('[WhatsApp] Erro ao enviar mensagem:', error)
    return false
  }
}

// Templates de mensagens em português
export const whatsappTemplates = {
  confirmacaoAgendamento: (params: {
    clientName: string
    serviceName: string
    professionalName: string
    date: string
    time: string
    address?: string
  }) => `Olá ${params.clientName}! 😊

✅ *Agendamento confirmado!*

📋 Serviço: ${params.serviceName}
👤 Profissional: ${params.professionalName}
📅 Data: ${params.date}
🕐 Horário: ${params.time}${params.address ? `\n📍 Endereço: ${params.address}` : ''}

Em caso de imprevisto, entre em contato com antecedência. Até logo!`,

  lembreteVigilia: (params: {
    clientName: string
    serviceName: string
    professionalName: string
    time: string
    address?: string
  }) => `Olá ${params.clientName}! 👋

📅 *Lembrete: Seu agendamento é amanhã!*

📋 Serviço: ${params.serviceName}
👤 Profissional: ${params.professionalName}
🕐 Horário: ${params.time}${params.address ? `\n📍 Endereço: ${params.address}` : ''}

Até amanhã! 😊`,

  lembreteDuasHoras: (params: {
    clientName: string
    serviceName: string
    professionalName: string
    time: string
    address?: string
  }) => `Olá ${params.clientName}! ⏰

Seu horário com ${params.professionalName} é *em 2 horas* (${params.time})!

📋 ${params.serviceName}${params.address ? `\n📍 ${params.address}` : ''}

Te esperamos! 🙂`,
}
