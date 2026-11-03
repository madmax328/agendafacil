export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { unit: string; id: string } }) {
  const session = await getSession()
  if (!session || session.role !== params.unit) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const amendment = await prisma.orderAmendment.findUnique({ where: { id: params.id } })
  if (!amendment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.orderAmendment.update({
    where: { id: params.id },
    data: { status: 'DONE' },
  })

  return NextResponse.json(updated)
}
