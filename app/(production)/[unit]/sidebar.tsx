'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, Package, LogOut } from 'lucide-react'

const PALETTES = [
  { bg: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-50' },
  { bg: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-50' },
  { bg: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-50' },
  { bg: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50' },
  { bg: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-50' },
  { bg: 'bg-purple-500', text: 'text-purple-700', badge: 'bg-purple-50' },
]

function unitColor(unit: string) {
  const idx = unit.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % PALETTES.length
  return PALETTES[idx]
}

export default function ProductionSidebar({ unit, unitName }: { unit: string; unitName: string }) {
  const pathname = usePathname()
  const colors = unitColor(unit)

  const links = [
    { href: `/${unit}`, label: 'Commandes', icon: ClipboardList, exact: true },
    { href: `/${unit}/produits`, label: 'Mes produits', icon: Package },
  ]

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.assign('/login')
  }

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 flex flex-col z-10 no-print">
      <div className="p-4 border-b border-gray-100">
        <Image src="/logo.png" alt="Artigus" width={100} height={32} className="h-8 w-auto mb-3" />
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">{unitName[0]}</span>
          </div>
          <div>
            <p className={`text-sm font-bold ${colors.text}`}>{unitName}</p>
            <p className="text-xs text-gray-400">ARTIGUS SA</p>
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
