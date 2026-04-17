'use client'

import * as React from 'react'
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
  Menu,
  X,
  LogOut,
  ChevronRight,
  Globe,
  BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/agenda',
    label: 'Agenda',
    icon: Calendar,
  },
  {
    href: '/clientes',
    label: 'Clientes',
    icon: Users,
  },
  {
    href: '/servicos',
    label: 'Serviços',
    icon: Scissors,
  },
  {
    href: '/configuracoes',
    label: 'Configurações',
    icon: Settings,
  },
  {
    href: '/relatorios',
    label: 'Relatórios',
    icon: BarChart2,
  },
  {
    href: '/assinatura',
    label: 'Assinatura',
    icon: CreditCard,
  },
]

const planLabels: Record<string, string> = {
  FREE: 'Gratuito',
  STARTER: 'Starter',
  PRO: 'Pro',
}

const planVariants: Record<string, 'default' | 'secondary' | 'success' | 'info'> = {
  FREE: 'secondary',
  STARTER: 'info',
  PRO: 'success',
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

interface SidebarProps {
  onClose?: () => void
}

function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const plan = (session?.user?.plan as string) ?? 'FREE'
  const planLabel = planLabels[plan] ?? 'Gratuito'
  const planVariant = planVariants[plan] ?? 'secondary'

  async function handleSignOut() {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <aside className="flex flex-col h-full bg-[#2563EB] dark:bg-[#161b22] text-white w-64 dark:border-r dark:border-[#30363d]">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-blue-500/40 dark:border-[#30363d]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
          onClick={onClose}
        >
          <div className="bg-white/20 rounded-lg p-1.5 group-hover:bg-white/30 transition-colors">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Markou</span>
        </Link>
        {/* Mobile close button */}
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 lg:hidden"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-blue-300">
          Menu principal
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'h-[18px] w-[18px] shrink-0',
                  isActive
                    ? 'text-white'
                    : 'text-blue-200 group-hover:text-white'
                )}
              />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-white/70" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Back to public site */}
      <div className="px-3 pb-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-blue-200 hover:bg-white/10 hover:text-white transition-colors text-sm"
        >
          <Globe className="h-4 w-4" />
          <span>Ver site público</span>
        </Link>
      </div>

      {/* User info at bottom */}
      <div className="px-3 py-4 border-t border-blue-500/40 dark:border-[#30363d]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors group">
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white/30">
            <AvatarImage
              src={session?.user?.image ?? undefined}
              alt={session?.user?.name ?? 'Usuário'}
            />
            <AvatarFallback className="bg-blue-400 text-white font-semibold text-xs">
              {getInitials(session?.user?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {session?.user?.name ?? 'Usuário'}
            </p>
            <Badge
              variant={planVariant}
              className="mt-0.5 text-[10px] px-1.5 py-0 h-4 bg-white/20 text-white border-white/30 hover:bg-white/20"
            >
              {planLabel}
            </Badge>
          </div>
          <button
            onClick={handleSignOut}
            className="shrink-0 p-1.5 rounded-md text-blue-200 hover:text-white hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
            title="Sair da conta"
            aria-label="Sair da conta"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#2563EB] dark:bg-[#161b22] text-white shadow-md dark:border-b dark:border-[#30363d]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <span className="font-bold text-base tracking-tight">
              Markou
            </span>
          </div>
          {/* Spacer to visually center the logo */}
          <div className="w-8" aria-hidden="true" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
