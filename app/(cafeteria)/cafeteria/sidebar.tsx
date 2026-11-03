'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, ClipboardList, LogOut } from 'lucide-react'

export default function CafeteriaSidebar({ cafeteriaName }: { cafeteriaName: string }) {
  const pathname = usePathname()

  const links = [
    { href: '/cafeteria', label: 'Passer commande', icon: ShoppingCart, exact: true },
    { href: '/cafeteria/commandes', label: 'Mes commandes', icon: ClipboardList },
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
          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{cafeteriaName[0]}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-blue-700 truncate max-w-[120px]">{cafeteriaName}</p>
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
                active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
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
