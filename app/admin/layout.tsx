import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { LayoutDashboard, Users, MessageSquare, LogOut } from 'lucide-react'

function isAdmin(email?: string | null): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  return adminEmails.includes(email.toLowerCase())
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="flex flex-col w-56 bg-gray-900 text-white shrink-0">
        <div className="px-5 py-5 border-b border-gray-700">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Admin</p>
          <p className="text-lg font-bold mt-0.5">Markou</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Overview
          </Link>
          <Link href="/admin/profissionais" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <Users className="h-4 w-4" /> Profissionais
          </Link>
          <Link href="/admin/suporte" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
            <MessageSquare className="h-4 w-4" /> Suporte
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" /> Sair do Admin
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
