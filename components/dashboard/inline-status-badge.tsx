'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  appointmentId: string
  currentStatus: string
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

const NEXT_STATUS: Record<string, string | null> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'COMPLETED',
  COMPLETED: null,
  CANCELLED: null,
}

const BADGE_CLASSES: Record<string, string> = {
  PENDING: 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 cursor-pointer',
  CONFIRMED: 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 cursor-pointer',
  COMPLETED: 'bg-gray-100 text-gray-600 border border-gray-200',
  CANCELLED: 'bg-red-100 text-red-700 border border-red-200',
}

export function InlineStatusBadge({ appointmentId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const nextStatus = NEXT_STATUS[status]

  async function handleClick() {
    if (!nextStatus || loading) return

    const label = STATUS_LABELS[nextStatus]
    if (!confirm(`Confirmar mudança de status para "${label}"?`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (res.ok) {
        setStatus(nextStatus)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!nextStatus || loading}
      title={nextStatus ? `Clique para marcar como ${STATUS_LABELS[nextStatus]}` : undefined}
      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 transition-colors disabled:cursor-default ${BADGE_CLASSES[status] ?? BADGE_CLASSES.PENDING}`}
    >
      {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      {STATUS_LABELS[status] ?? status}
    </button>
  )
}
