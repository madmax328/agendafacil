import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const tickets = await (prisma as any).supportMessage.findMany({
    where: { professionalId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      replies: { orderBy: { createdAt: 'asc' } },
    },
  })

  // Clear unread flags now that pro is viewing
  const unreadIds = tickets.filter((t: any) => t.proHasUnread).map((t: any) => t.id)
  if (unreadIds.length > 0) {
    await (prisma as any).supportMessage.updateMany({
      where: { id: { in: unreadIds } },
      data: { proHasUnread: false },
    })
  }

  return NextResponse.json(tickets)
}
