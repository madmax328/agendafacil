export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CafeteriaShell from './shell'

export default async function CafeteriaLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'cafeteria') redirect('/login')

  const lockedCount = await prisma.productionUnit.count({ where: { allowOrderModification: false } })

  return (
    <CafeteriaShell cafeteriaName={session.name} hasLockedUnits={lockedCount > 0}>
      {children}
    </CafeteriaShell>
  )
}
