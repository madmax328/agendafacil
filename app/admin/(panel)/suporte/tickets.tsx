'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle, Clock, ChevronDown, ChevronUp, Send, Loader2, Eye } from 'lucide-react'

interface Reply {
  id: string
  replyText: string
  authorType: string
  createdAt: string
}

interface Ticket {
  id: string
  professionalName: string
  professionalEmail: string
  subject: string
  message: string
  status: string
  readByAdmin: boolean
  createdAt: string
  replies: Reply[]
}

const statusLabel: Record<string, string> = {
  open: 'Aberto',
  answered: 'Respondido',
  closed: 'Encerrado',
}

const statusColor: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  answered: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-500',
}

export default function SupportTickets({ tickets: initial }: { tickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'answered' | 'closed'>('all')
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replying, setReplying] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState<string | null>(null)

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter)
  const unreadCount = tickets.filter(t => !t.readByAdmin).length

  async function toggleExpand(ticket: Ticket) {
    const isOpening = expanded !== ticket.id
    setExpanded(isOpening ? ticket.id : null)
    if (isOpening && !ticket.readByAdmin) {
      await fetch(`/api/admin/suporte/${ticket.id}`, { method: 'GET' })
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, readByAdmin: true } : t))
    }
  }

  async function handleReply(ticketId: string) {
    const text = replyText[ticketId]?.trim()
    if (!text) return
    setReplying(ticketId)
    try {
      const res = await fetch(`/api/admin/suporte/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText: text }),
      })
      if (!res.ok) return
      const data = await res.json()
      setTickets(prev => prev.map(t =>
        t.id === ticketId
          ? { ...t, status: 'answered', replies: [...t.replies, data.reply] }
          : t
      ))
      setReplyText(prev => ({ ...prev, [ticketId]: '' }))
    } finally {
      setReplying(null)
    }
  }

  async function changeStatus(ticket: Ticket, status: string) {
    setStatusLoading(ticket.id)
    try {
      await fetch(`/api/admin/suporte/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status } : t))
    } finally {
      setStatusLoading(null)
    }
  }

  const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'open', label: 'Abertos' },
    { value: 'answered', label: 'Respondidos' },
    { value: 'closed', label: 'Encerrados' },
  ] as const

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suporte</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tickets.length} total
            {unreadCount > 0 && (
              <span className="ml-2 text-red-500 font-semibold">· {unreadCount} não lido{unreadCount !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterOptions.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <MessageSquare className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nenhum ticket encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => (
            <div
              key={ticket.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                !ticket.readByAdmin
                  ? 'border-blue-300 shadow-blue-50'
                  : ticket.status === 'open'
                  ? 'border-amber-200'
                  : 'border-gray-100'
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-4 p-4">
                <div className={`shrink-0 p-2 rounded-xl ${
                  !ticket.readByAdmin ? 'bg-blue-50' :
                  ticket.status === 'open' ? 'bg-amber-50' :
                  ticket.status === 'answered' ? 'bg-emerald-50' : 'bg-gray-50'
                }`}>
                  {!ticket.readByAdmin ? (
                    <Eye className="h-4 w-4 text-blue-500" />
                  ) : ticket.status === 'answered' ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{ticket.subject}</p>
                    {!ticket.readByAdmin && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">NOVO</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColor[ticket.status] ?? statusColor.open}`}>
                      {statusLabel[ticket.status] ?? ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <p className="text-xs text-gray-600 font-medium">{ticket.professionalName}</p>
                    <p className="text-xs text-gray-400">{ticket.professionalEmail}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    {ticket.replies.length > 0 && (
                      <p className="text-xs text-gray-400">{ticket.replies.length} resposta{ticket.replies.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ticket.status === 'open' && (
                    <button
                      onClick={() => changeStatus(ticket, 'closed')}
                      disabled={statusLoading === ticket.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Encerrar
                    </button>
                  )}
                  {(ticket.status === 'answered' || ticket.status === 'closed') && (
                    <button
                      onClick={() => changeStatus(ticket, 'open')}
                      disabled={statusLoading === ticket.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                    >
                      Reabrir
                    </button>
                  )}
                  <button
                    onClick={() => toggleExpand(ticket)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    {expanded === ticket.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded */}
              {expanded === ticket.id && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-4 space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Mensagem</p>
                    <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                    </div>
                  </div>

                  {ticket.replies.map(reply => (
                    <div key={reply.id}>
                      {reply.authorType === 'PROFESSIONAL' ? (
                        <>
                          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wide mb-1.5">
                            Resposta do profissional · {new Date(reply.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </p>
                          <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-400">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{reply.replyText}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">
                            A tua resposta · {new Date(reply.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </p>
                          <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-400">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{reply.replyText}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {ticket.status !== 'closed' && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        {ticket.replies.length > 0 ? 'Resposta adicional' : 'Responder'}
                      </p>
                      <textarea
                        value={replyText[ticket.id] ?? ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                        rows={4}
                        placeholder="Escreve a tua resposta..."
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleReply(ticket.id)}
                          disabled={replying === ticket.id || !replyText[ticket.id]?.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {replying === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          {replying === ticket.id ? 'A enviar...' : 'Enviar resposta'}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">
                        O profissional receberá um email com a tua resposta.
      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
