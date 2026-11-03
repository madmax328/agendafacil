'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PlusCircle, History, LogOut } from 'lucide-react'

export default function CafeteriaSidebar({ cafeteriaName }: { cafeteriaName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    { href: '/cafeteria', label: 'Passer une commande', icon: PlusCircle, exact: true },
    { href: '/cafeteria/historique', label: 'Historique', icon: History },
  ]

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.assign('/login')
  }

  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 flex flex-col z-10 no-print">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{cafeteriaName[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{cafeteriaName}</p>
            <p className="text-xs text-gray-500">Cafétéria</p>
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
                active ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
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
