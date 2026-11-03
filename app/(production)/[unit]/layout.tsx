export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProductionSidebar from './sidebar'

export default async function ProductionLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { unit: string }
}) {
  const session = await getSession()
  const unit = params.unit.toLowerCase()

  if (!session || session.role !== unit) redirect('/login')

  const dbUnit = await prisma.productionUnit.findFirst({ where: { type: unit.toUpperCase() } })
  if (!dbUnit) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <ProductionSidebar unit={unit} unitName={session.name} />
      <main className="flex-1 ml-56 p-8 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}
