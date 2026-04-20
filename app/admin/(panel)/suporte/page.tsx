import { prisma } from '@/lib/prisma'
import SupportTickets from './tickets'

export const dynamic = 'force-dynamic'

export default async function AdminSuportePage() {
  const tickets = await (prisma as any).supportMessage.findMany({
    orderBy: { createdAt: 'desc' },
    include: { replies: { orderBy: { createdAt: 'asc' } } },
  })

  return <SupportTickets tickets={tickets} />
}
