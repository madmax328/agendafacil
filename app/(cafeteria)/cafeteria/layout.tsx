import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import CafeteriaSidebar from './sidebar'

export default async function CafeteriaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'cafeteria') redirect('/login')

  return (
    <div className="flex min-h-screen">
      <CafeteriaSidebar cafeteriaName={session.name} />
      <main className="flex-1 ml-56 p-8 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}
