'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, MapPin } from 'lucide-react'

const TIPOS_MOBILE = [
  { value: '', label: 'Todos' },
  { value: 'salao', label: 'Salão' },
  { value: 'barbearia', label: 'Barbearia' },
  { value: 'clinica', label: 'Clínica' },
  { value: 'dentista', label: 'Dentista' },
  { value: 'estetica', label: 'Estética' },
  { value: 'massagem', label: 'Massagem' },
  { value: 'outros', label: 'Outros' },
]

export function ProfissionaisSearch({
  initialTipo,
  initialCidade,
  initialQ,
}: {
  initialTipo?: string
  initialCidade?: string
  initialQ?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [q, setQ] = useState(initialQ ?? '')
  const [cidade, setCidade] = useState(initialCidade ?? '')
  const [tipo, setTipo] = useState(initialTipo ?? '')

  function navigate(overrides: { q?: string; cidade?: string; tipo?: string } = {}) {
    const params = new URLSearchParams()
    const nq = overrides.q ?? q
    const nc = overrides.cidade ?? cidade
    const nt = overrides.tipo !== undefined ? overrides.tipo : tipo
    if (nq.trim()) params.set('q', nq.trim())
    if (nc.trim()) params.set('cidade', nc.trim())
    if (nt) params.set('tipo', nt)
    startTransition(() => router.push(`/profissionais?${params.toString()}`))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    navigate()
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Buscar por nome, serviço..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>
        <div className="relative sm:w-52">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            placeholder="Cidade..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 shrink-0"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Buscar
        </button>
      </form>

      {/* Mobile category pills — hidden on lg (sidebar handles it there) */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden scrollbar-hide">
        {TIPOS_MOBILE.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => { setTipo(t.value); navigate({ tipo: t.value }) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border shrink-0 ${
              tipo === t.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
