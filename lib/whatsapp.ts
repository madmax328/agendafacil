// Integração com Z-API para envio de mensagens WhatsApp
// Cada profissional usa as suas próprias credenciais Z-API

export interface WhatsAppCredentials {
  instanceId: string
  instanceToken: string
  clientToken?: string  // Security Token — usa instanceToken como fallback
}

interface SendMessageParams {
  phone: string
  message: string
  credentials: WhatsAppCredentials
}

export async function sendWhatsAppMessage({
  phone,
  message,
  credentials,
}: SendMessageParams): Promise<boolean> {
  const { instanceId, instanceToken, clientToken } = credentials

  if (!instanceId || !instanceToken) {
    console.warn('[WhatsApp] Credenciais não configuradas para este profissional')
    return false
  }

  try {
    const formattedPhone = formatPhone(phone)
    const authToken = clientToken || instanceToken

    const response = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${instanceToken}/send-text`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Token': authToken,
        },
        body: JSON.stringify({ phone: formattedPhone, message }),
        signal: AbortSignal.timeout(10000),
      },
    )

    if (!response.ok) {
      console.error('[WhatsApp] Erro ao enviar:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('[WhatsApp] Erro na integração:', error)
    return false
  }
}

// Formata número para padrão E.164 com DDI Brasil
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55')) return digits
  return `55${digits}`
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
