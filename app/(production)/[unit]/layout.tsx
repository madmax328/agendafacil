export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import ProductionSidebar from './sidebar'

const VALID_UNITS = ['cuisine', 'boulangerie', 'pizzeria']

export default async function ProductionLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { unit: string }
}) {
  const session = await getSession()
  const unit = params.unit.toLowerCase()

  if (!VALID_UNITS.includes(unit)) redirect('/login')
  if (!session || session.role !== unit) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <ProductionSidebar unit={unit} unitName={session.name} />
      <main className="flex-1 ml-56 p-8 min-h-screen bg-gray-50">
        {children}
      </main>
    </div>
  )
}
