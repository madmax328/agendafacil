'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'salao', label: '💇 Salão' },
  { value: 'barbearia', label: '✂️ Barbearia' },
  { value: 'clinica', label: '🏥 Clínica' },
  { value: 'dentista', label: '🦷 Dentista' },
  { value: 'psicologo', label: '🧠 Psicólogo' },
  { value: 'estetica', label: '✨ Estética' },
  { value: 'massagem', label: '💆 Massagem' },
  { value: 'nutricionista', label: '🥗 Nutricionista' },
  { value: 'fisioterapia', label: '🦴 Fisioterapia' },
  { value: 'outros', label: '📋 Outros' },
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (cidade.trim()) params.set('cidade', cidade.trim())
    if (tipo) params.set('tipo', tipo)
    startTransition(() => {
      router.push(`/profissionais?${params.toString()}`)
    })
  }

  function handleTipoClick(value: string) {
    const newTipo = value === tipo ? '' : value
    setTipo(newTipo)
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (cidade.trim()) params.set('cidade', cidade.trim())
    if (newTipo) params.set('tipo', newTipo)
    startTransition(() => {
      router.push(`/profissionais?${params.toString()}`)
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou serviço..."
            className="pl-9 border-gray-200"
          />
        </div>
        <div className="relative sm:w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" style={{ display: 'none' }} />
          <Input
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade..."
            className="border-gray-200"
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shrink-0"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Buscar
        </Button>
      </form>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {TIPOS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => handleTipoClick(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
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
