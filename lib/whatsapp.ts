// Integração com Z-API para envio de mensagens WhatsApp

const ZAPI_BASE_URL = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}`

interface SendMessageParams {
  phone: string
  message: string
}

export async function sendWhatsAppMessage({ phone, message }: SendMessageParams): Promise<boolean> {
  try {
    // Formata o número para padrão internacional
    const formattedPhone = formatPhone(phone)

    const response = await fetch(`${ZAPI_BASE_URL}/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': process.env.ZAPI_TOKEN || '',
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message,
      }),
    })

    if (!response.ok) {
      console.error('Erro ao enviar mensagem WhatsApp:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Erro na integração WhatsApp:', error)
    return false
  }
}

// Formata número de telefone para padrão E.164
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
