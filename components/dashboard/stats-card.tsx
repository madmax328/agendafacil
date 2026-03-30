import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type TrendDirection = 'up' | 'down'

interface Trend {
  /** Percentage value (e.g. 12.5 means +12.5%) */
  value: number
  direction: TrendDirection
}

interface StatsCardProps {
  /** Lucide icon component */
  icon: LucideIcon
  /** Card title / metric label */
  title: string
  /** Primary metric value (e.g. "R$ 3.200", "42", "87%") */
  value: string
  /** Supporting description text */
  description?: string
  /** Optional trend indicator */
  trend?: Trend
  /** Additional class names for the card wrapper */
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatsCard({
  icon: Icon,
  title,
  value,
  description,
  trend,
  className,
}: StatsCardProps) {
  const isUp = trend?.direction === 'up'

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Icon */}
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
          <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
        </div>

        {/* Trend badge */}
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              isUp
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-600'
            )}
            aria-label={`Tendência: ${isUp ? 'alta' : 'baixa'} de ${trend.value.toFixed(1)}%`}
          >
            {isUp ? (
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
            )}
            <span>
              {isUp ? '+' : '-'}
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Metric */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        {description && (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        )}
      </div>
    </div>
  )
}
