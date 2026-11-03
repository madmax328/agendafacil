'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import AdminSidebar from './sidebar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-screen">
      <AdminSidebar mobileOpen={open} onClose={() => setOpen(false)} />
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex-1 lg:ml-56 min-h-screen flex flex-col">
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 no-print">
          <button onClick={() => setOpen(true)} className="p-1.5 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <span className="font-bold text-gray-900 text-sm">Artigus SA — Admin</span>
        </div>
        <main className="flex-1 p-4 lg:p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
