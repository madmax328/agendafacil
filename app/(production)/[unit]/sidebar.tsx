'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ClipboardList, Package, LogOut } from 'lucide-react'

const UNIT_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  cuisine: { bg: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-50' },
  boulangerie: { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50' },
  pizzeria: { bg: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-50' },
}

export default function ProductionSidebar({ unit, unitName }: { unit: string; unitName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const colors = UNIT_COLORS[unit] ?? UNIT_COLORS.cuisine

  const links = [
    { href: `/${unit}`, label: 'Commandes', icon: ClipboardList, exact: true },
    { href: `/${unit}/produits`, label: 'Mes produits', icon: Package },
  ]

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 flex flex-col z-10 no-print">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">{unitName[0]}</span>
          </div>
          <div>
            <p className={`text-sm font-bold ${colors.text}`}>{unitName}</p>
            <p className="text-xs text-gray-500">ARTIGUS SA</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? `${colors.badge} ${colors.text} font-medium` : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
