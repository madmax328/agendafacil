export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CafeteriaSidebar from './sidebar'

export default async function CafeteriaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'cafeteria') redirect('/login')

  const lockedCount = await prisma.productionUnit.count({ where: { allowOrderModification: false } })

  return (
    <div className="flex min-h-screen">
      <CafeteriaSidebar cafeteriaName={session.name} hasLockedUnits={lockedCount > 0} />
      <main className="flex-1 ml-56 p-8 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}
