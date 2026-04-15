'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Settings,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type Plan = 'FREE' | 'STARTER' | 'PRO'

// ─── Constants ───────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Agenda', href: '/agenda', icon: Calendar },
  { label: 'Clientes', href: '/clientes', icon: Users },
  { label: 'Serviços', href: '/servicos', icon: Scissors },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
  { label: 'Assinatura', href: '/assinatura', icon: CreditCard },
]

const PLAN_BADGE_STYLES: Record<Plan, string> = {
  FREE: 'bg-gray-400 text-white',
  STARTER: 'bg-amber-400 text-white',
  PRO: 'bg-emerald-400 text-white',
}

// ─── Plan Badge ───────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        PLAN_BADGE_STYLES[plan]
      )}
    >
      {plan}
    </span>
  )
}

// ─── User Avatar ──────────────────────────────────────────────────────────────

function UserInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-400 text-sm font-semibold text-white">
      {initials || '?'}
    </div>
  )
}

// ─── Sidebar Component ────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const user = session?.user
  const plan = (user?.plan ?? 'FREE') as Plan
  const displayName = user?.businessName || user?.name || 'Usuário'

  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  async function handleSignOut() {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <aside className="flex h-full w-64 flex-col bg-[#2563EB] text-white">
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center px-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
        >
          Markou
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5 flex-shrink-0',
                      active ? 'text-white' : 'text-blue-200'
                    )}
                  />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="flex-shrink-0 border-t border-blue-500 p-4">
        <div className="flex items-center gap-3 mb-3">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={displayName}
              className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
            />
          ) : (
            <UserInitials name={displayName} />
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-blue-200">{user?.email}</p>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-blue-200">Plano atual</span>
          <PlanBadge plan={plan} />
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-100 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
