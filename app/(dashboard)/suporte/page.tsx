'use client'

import { useState } from 'react'
import { Loader2, Send, HelpCircle, MessageSquare, Zap, BookOpen } from 'lucide-react'
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

export default function SuportePage() {
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

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
    } catch {
      toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suporte & Ajuda</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tens alguma dúvida ou problema? Envia-nos uma mensagem e respondemos em breve.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* Contact form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Enviar mensagem</h2>
          </div>

          {sent ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Mensagem enviada!</p>
              <p className="text-sm text-gray-500">
                A nossa equipa irá responder directamente para o teu email em breve.
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setMessage('') }}
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
                  rows={7}
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
                Responderemos para o email da tua conta Markou.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
