'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'
import { Clock, User, Scissors, CheckCircle2, XCircle, CheckCheck } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

interface AppointmentCardProps {
  id: string
  clientName: string
  serviceName: string
  scheduledAt: Date | string
  durationMinutes: number
  status: AppointmentStatus
  /** Called when "Confirmar" is clicked; receives the appointment id */
  onConfirm?: (id: string) => Promise<void> | void
  /** Called when "Cancelar" is clicked; receives the appointment id */
  onCancel?: (id: string) => Promise<void> | void
  /** Called when "Concluído" is clicked; receives the appointment id */
  onComplete?: (id: string) => Promise<void> | void
  className?: string
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; badgeClass: string }
> = {
  PENDING: {
    label: 'Pendente',
    badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  CONFIRMED: {
    label: 'Confirmado',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  COMPLETED: {
    label: 'Concluído',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
  },
  CANCELLED: {
    label: 'Cancelado',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
  },
}

const CARD_BORDER: Record<AppointmentStatus, string> = {
  PENDING: 'border-l-yellow-400',
  CONFIRMED: 'border-l-blue-500',
  COMPLETED: 'border-l-green-500',
  CANCELLED: 'border-l-red-400',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppointmentCard({
  id,
  clientName,
  serviceName,
  scheduledAt,
  durationMinutes,
  status,
  onConfirm,
  onCancel,
  onComplete,
  className,
}: AppointmentCardProps) {
  const [loadingAction, setLoadingAction] = useState<
    'confirm' | 'cancel' | 'complete' | null
  >(null)

  const statusConfig = STATUS_CONFIG[status]
  const isFinal = status === 'COMPLETED' || status === 'CANCELLED'

  async function handleAction(
    action: 'confirm' | 'cancel' | 'complete',
    handler?: (id: string) => Promise<void> | void
  ) {
    if (!handler) return
    setLoadingAction(action)
    try {
      await handler(id)
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm',
        'border-l-4 transition-shadow hover:shadow-md',
        CARD_BORDER[status],
        className
      )}
    >
      {/* Header row: client name + status badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <User className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
          <span className="truncate font-semibold text-gray-900">{clientName}</span>
        </div>
        <span
          className={cn(
            'flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
            statusConfig.badgeClass
          )}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Service and time */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <Scissors className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {serviceName}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {formatTime(scheduledAt)}
          <span className="text-gray-400">({durationMinutes} min)</span>
        </span>
      </div>

      {/* Action buttons — hidden for final states */}
      {!isFinal && (
        <div className="flex flex-wrap gap-2 pt-1">
          {status === 'PENDING' && onConfirm && (
            <ActionButton
              label="Confirmar"
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              variant="confirm"
              loading={loadingAction === 'confirm'}
              disabled={loadingAction !== null}
              onClick={() => handleAction('confirm', onConfirm)}
            />
          )}

          {(status === 'PENDING' || status === 'CONFIRMED') && onComplete && (
            <ActionButton
              label="Concluído"
              icon={<CheckCheck className="h-3.5 w-3.5" />}
              variant="complete"
              loading={loadingAction === 'complete'}
              disabled={loadingAction !== null}
              onClick={() => handleAction('complete', onComplete)}
            />
          )}

          {onCancel && (
            <ActionButton
              label="Cancelar"
              icon={<XCircle className="h-3.5 w-3.5" />}
              variant="cancel"
              loading={loadingAction === 'cancel'}
              disabled={loadingAction !== null}
              onClick={() => handleAction('cancel', onCancel)}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Internal action button ───────────────────────────────────────────────────

type ActionVariant = 'confirm' | 'complete' | 'cancel'

const ACTION_STYLES: Record<ActionVariant, string> = {
  confirm:
    'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50',
  complete:
    'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50',
  cancel:
    'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50',
}

interface ActionButtonProps {
  label: string
  icon: React.ReactNode
  variant: ActionVariant
  loading: boolean
  disabled: boolean
  onClick: () => void
}

function ActionButton({
  label,
  icon,
  variant,
  loading,
  disabled,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
        ACTION_STYLES[variant]
      )}
      aria-busy={loading}
    >
      {loading ? (
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
      {label}
    </button>
  )
}
