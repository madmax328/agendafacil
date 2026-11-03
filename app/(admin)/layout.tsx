import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSidebar from './sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-56 p-8 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}
