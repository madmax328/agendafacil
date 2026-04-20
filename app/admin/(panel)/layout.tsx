import { getAdminSession } from '@/lib/admin-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminShell from './shell'

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const adminCount = await (prisma as any).adminUser.count()
  if (adminCount === 0) redirect('/admin/setup')

  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const unreadCount = await (prisma as any).supportMessage.count({ where: { readByAdmin: false } })

  return <AdminShell unreadCount={unreadCount}>{children}</AdminShell>
}
