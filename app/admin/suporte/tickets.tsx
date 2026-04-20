'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle, Clock, ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Ticket {
  id: string
  professionalId: string
  professionalName: string
  professionalEmail: string
  subject: string
  message: string
  status: string
  createdAt: string
}

export default function SupportTickets({ tickets: initial }: { tickets: Ticket[] }) {
  const [tickets, setTickets] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter)
  const openCount = tickets.filter(t => t.status === 'open').length

  async function toggleStatus(ticket: Ticket) {
    const newStatus = ticket.status === 'open' ? 'resolved' : 'open'
    setLoading(ticket.id)
    try {
      await fetch(`/api/admin/suporte/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: newStatus } : t))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suporte</h1>
          <p className="text-sm text-gray-500 mt-1">{openCount} ticket{openCount !== 1 ? 's' : ''} aberto{openCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'open', 'resolved'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'open' ? 'Abertos' : 'Resolvidos'}
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
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                ticket.status === 'open' ? 'border-amber-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                <div className={`shrink-0 p-2 rounded-xl ${ticket.status === 'open' ? 'bg-amber-50' : 'bg-gray-50'}`}>
                  {ticket.status === 'open'
                    ? <Clock className="h-4 w-4 text-amber-500" />
                    : <CheckCircle className="h-4 w-4 text-emerald-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{ticket.subject}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      ticket.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {ticket.status === 'open' ? 'Aberto' : 'Resolvido'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs text-gray-500">{ticket.professionalName}</p>
                    <a
                      href={`mailto:${ticket.professionalEmail}`}
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {ticket.professionalEmail}
                    </a>
                    <p className="text-xs text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleStatus(ticket)}
                    disabled={loading === ticket.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                      ticket.status === 'open'
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {ticket.status === 'open' ? 'Marcar resolvido' : 'Reabrir'}
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    {expanded === ticket.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {expanded === ticket.id && (
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-gray-50 rounded-xl p-4 border-l-4 border-blue-400">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <a
                      href={`mailto:${ticket.professionalEmail}?subject=Re: ${encodeURIComponent(ticket.subject)}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Responder por email
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
