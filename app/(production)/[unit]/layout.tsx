export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProductionShell from './shell'

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
    <ProductionShell unit={unit} unitName={session.name}>
      {children}
    </ProductionShell>
  )
}
