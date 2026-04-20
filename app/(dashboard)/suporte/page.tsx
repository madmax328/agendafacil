'use client'

import { useState, useEffect } from 'react'
import { Loader2, Send, HelpCircle, MessageSquare, Zap, BookOpen, ChevronDown, ChevronUp, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const SUBJECTS = [
  'Problema técnico',
  'Dúvida sobre funcionalidades',
  'Problema com pagamento / assinatura',
  'Sugestão de melhoria',
  'Conta ou acesso',
  'Outro',
]

const FAQS = [
  {
    q: 'Como adiciono um novo serviço?',
    a: 'Acede a Serviços no menu lateral → clica em "Novo serviço" e preenche o nome, duração e preço.',
  },
  {
    q: 'Como altero os meus horários de disponibilidade?',
    a: 'Acede a Configurações → separador "Disponibilidade" e define os dias e horários que trabalhas.',
  },
  {
    q: 'Os clientes recebem lembretes automáticos?',
    a: 'Sim. Os planos Starter e Pro enviam lembretes por email 24h e 2h antes do agendamento.',
  },
  {
    q: 'Como cancelo a minha assinatura?',
    a: 'Acede a Assinatura → "Gerir assinatura" → Cancelar. O plano fica ativo até ao fim do período pago.',
  },
]

interface SupportReply {
  id: string
  replyText: string
  createdAt: string
}

interface Ticket {
  id: string
  subject: string
  message: string
  status: string
  createdAt: string
  replies: SupportReply[]
}

const statusLabel: Record<string, string> = {
  open: 'Aguardando resposta',
  answered: 'Respondido',
  closed: 'Encerrado',
}

const statusColor: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  answered: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-500',
}

export default function SuportePage() {
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const { toast } = useToast()

  async function loadTickets() {
    setTicketsLoading(true)
    try {
      const res = await fetch('/api/suporte/meus-tickets')
      if (res.ok) setTickets(await res.json())
    } finally {
      setTicketsLoading(false)
    }
  }

  useEffect(() => { loadTickets() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/suporte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error || 'Erro ao enviar', variant: 'destructive' })
        return
      }
      setSent(true)
      setMessage('')
      await loadTickets()
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const hasAnswered = tickets.some(t => t.status === 'answered' && t.replies.length > 0)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suporte & Ajuda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Envia uma mensagem à nossa equipa. Respondemos directamente aqui no dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Left column */}
        <div className="space-y-6">

          {/* Contact form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">Nova mensagem</h2>
            </div>

            {sent ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Send className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">Mensagem enviada!</p>
                <p className="text-sm text-gray-500">
                  Receberás um email de confirmação. Serás notificado quando respondermos.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-2 text-sm text-blue-600 hover:underline font-medium"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Assunto</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">
                    Mensagem
                    <span className="text-gray-400 font-normal ml-1">({message.length}/2000)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                    disabled={loading}
                    rows={6}
                    maxLength={2000}
                    placeholder="Descreve o teu problema ou dúvida com o máximo de detalhe possível..."
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !message.trim()}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? 'A enviar...' : 'Enviar mensagem'}
                </button>
              </form>
            )}
          </div>

          {/* Ticket history */}
          {(ticketsLoading || tickets.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-bold text-gray-900">Histórico de pedidos</h2>
                  {hasAnswered && (
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      RESPONDIDO
                    </span>
                  )}
                </div>
                <button
                  onClick={loadTickets}
                  disabled={ticketsLoading}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
                  title="Actualizar"
                >
                  <RefreshCw className={`h-4 w-4 ${ticketsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {ticketsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className={`rounded-xl border overflow-hidden ${
                        ticket.status === 'answered' ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'
                      }`}
                    >
                      <button
                        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
                        onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                      >
                        <div className={`shrink-0 p-1.5 rounded-lg ${ticket.status === 'answered' ? 'bg-emerald-100' : 'bg-amber-50'}`}>
                          {ticket.status === 'answered'
                            ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                            : <Clock className="h-4 w-4 text-amber-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColor[ticket.status] ?? statusColor.open}`}>
                              {statusLabel[ticket.status] ?? ticket.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                            {ticket.replies.length > 0 && (
                              <span className="text-xs text-gray-400">{ticket.replies.length} resposta{ticket.replies.length !== 1 ? 's' : ''}</span>
                            )}
                          </div>
                        </div>
                        {expanded === ticket.id
                          ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                          : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                        }
                      </button>

                      {expanded === ticket.id && (
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
                          <div className="pt-3">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">A tua mensagem</p>
                            <div className="bg-gray-50 rounded-xl p-3 border-l-4 border-blue-300">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                            </div>
                          </div>

                          {ticket.replies.map(reply => (
                            <div key={reply.id}>
                              <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">Resposta da equipa Markou</p>
                              <div className="bg-emerald-50 rounded-xl p-3 border-l-4 border-emerald-400">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{reply.replyText}</p>
                                <p className="text-[11px] text-gray-400 mt-2">
                                  {new Date(reply.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          ))}

                          {ticket.replies.length === 0 && (
                            <p className="text-xs text-gray-400 text-center py-2">A aguardar resposta da nossa equipa...</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FAQ sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900">Perguntas frequentes</h2>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-gray-800">{faq.q}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{faq.a}</p>
                  {i < FAQS.length - 1 && <hr className="mt-4 border-gray-100" />}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-bold text-blue-900">Tempo de resposta</p>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              Respondemos geralmente em menos de 24 horas nos dias úteis.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-600">
                Serás notificado por email quando respondermos.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
