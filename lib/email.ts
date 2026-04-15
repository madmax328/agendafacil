import { Resend } from 'resend'

function getClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

function getFrom() {
  return process.env.RESEND_FROM_EMAIL ?? 'Markou <noreply@markou.app>'
}

// ── Templates ──────────────────────────────────────────────────────────────────

interface ConfirmacaoParams {
  clientName: string
  clientEmail: string
  serviceName: string
  professionalName: string
  date: string
  time: string
  address?: string
}

interface LembreteParams {
  clientName: string
  clientEmail: string
  serviceName: string
  professionalName: string
  date: string
  time: string
  address?: string
}

function confirmacaoHtml(p: ConfirmacaoParams): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td style="background:#2563eb;padding:32px 40px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">✅ Agendamento Confirmado</h1>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <p style="margin:0 0 20px;color:#374151;font-size:15px">Olá, <strong>${p.clientName}</strong>!</p>
          <p style="margin:0 0 24px;color:#374151;font-size:15px">Seu agendamento foi confirmado com sucesso. Veja os detalhes abaixo:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px">
            <tr><td style="padding:6px 0">
              <span style="color:#6b7280;font-size:13px">Estabelecimento</span><br>
              <strong style="color:#111827;font-size:15px">${p.professionalName}</strong>
            </td></tr>
            <tr><td style="padding:6px 0;border-top:1px solid #e5e7eb">
              <span style="color:#6b7280;font-size:13px">Serviço</span><br>
              <strong style="color:#111827;font-size:15px">${p.serviceName}</strong>
            </td></tr>
            <tr><td style="padding:6px 0;border-top:1px solid #e5e7eb">
              <span style="color:#6b7280;font-size:13px">Data e horário</span><br>
              <strong style="color:#111827;font-size:15px">📅 ${p.date} às ${p.time}</strong>
            </td></tr>
            ${p.address ? `<tr><td style="padding:6px 0;border-top:1px solid #e5e7eb">
              <span style="color:#6b7280;font-size:13px">Endereço</span><br>
              <strong style="color:#111827;font-size:15px">📍 ${p.address}</strong>
            </td></tr>` : ''}
          </table>
          <p style="margin:0;color:#6b7280;font-size:13px">Se precisar cancelar ou reagendar, entre em contacto directamente com o estabelecimento.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">Markou — Sistema de Agendamento Online</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function lembreteHtml(p: LembreteParams, tipo: 'J-1' | 'H-2'): string {
  const titulo = tipo === 'J-1'
    ? '📅 Lembrete: Seu agendamento é amanhã!'
    : '⏰ Lembrete: Seu agendamento é em 2 horas!'
  const subtitulo = tipo === 'J-1'
    ? 'Não se esqueça — você tem um agendamento amanhã.'
    : 'Seu agendamento começa em aproximadamente 2 horas.'

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <tr><td style="background:#7c3aed;padding:32px 40px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">${titulo}</h1>
        </td></tr>
        <tr><td style="padding:32px 40px">
          <p style="margin:0 0 20px;color:#374151;font-size:15px">Olá, <strong>${p.clientName}</strong>!</p>
          <p style="margin:0 0 24px;color:#374151;font-size:15px">${subtitulo}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px">
            <tr><td style="padding:6px 0">
              <span style="color:#6b7280;font-size:13px">Estabelecimento</span><br>
              <strong style="color:#111827;font-size:15px">${p.professionalName}</strong>
            </td></tr>
            <tr><td style="padding:6px 0;border-top:1px solid #e5e7eb">
              <span style="color:#6b7280;font-size:13px">Serviço</span><br>
              <strong style="color:#111827;font-size:15px">${p.serviceName}</strong>
            </td></tr>
            <tr><td style="padding:6px 0;border-top:1px solid #e5e7eb">
              <span style="color:#6b7280;font-size:13px">Data e horário</span><br>
              <strong style="color:#111827;font-size:15px">📅 ${p.date} às ${p.time}</strong>
            </td></tr>
            ${p.address ? `<tr><td style="padding:6px 0;border-top:1px solid #e5e7eb">
              <span style="color:#6b7280;font-size:13px">Endereço</span><br>
              <strong style="color:#111827;font-size:15px">📍 ${p.address}</strong>
            </td></tr>` : ''}
          </table>
          <p style="margin:0;color:#6b7280;font-size:13px">Se precisar cancelar ou reagendar, entre em contacto directamente com o estabelecimento.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:12px">Markou — Sistema de Agendamento Online</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Send functions ─────────────────────────────────────────────────────────────

export async function sendConfirmacaoEmail(p: ConfirmacaoParams): Promise<boolean> {
  if (!p.clientEmail) return false
  const client = getClient()
  if (!client) { console.warn('[Email] RESEND_API_KEY não configurado'); return false }

  try {
    await client.emails.send({
      from: getFrom(),
      to: p.clientEmail,
      subject: `✅ Agendamento confirmado — ${p.professionalName}`,
      html: confirmacaoHtml(p),
    })
    return true
  } catch (err) {
    console.error('[Email] Erro ao enviar confirmação:', err)
    return false
  }
}

export async function sendLembreteEmail(p: LembreteParams, tipo: 'J-1' | 'H-2'): Promise<boolean> {
  if (!p.clientEmail) return false
  const client = getClient()
  if (!client) { console.warn('[Email] RESEND_API_KEY não configurado'); return false }

  const subject = tipo === 'J-1'
    ? `📅 Lembrete: seu agendamento em ${p.professionalName} é amanhã`
    : `⏰ Lembrete: seu agendamento em ${p.professionalName} começa em 2 horas`

  try {
    await client.emails.send({
      from: getFrom(),
      to: p.clientEmail,
      subject,
      html: lembreteHtml(p, tipo),
    })
    return true
  } catch (err) {
    console.error('[Email] Erro ao enviar lembrete:', err)
    return false
  }
}
