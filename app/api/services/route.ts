import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const services = await prisma.service.findMany({
    where: { professionalId: session.user.id },
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
  })

  return NextResponse.json(services)
}
