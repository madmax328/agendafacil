import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

/**
 * Root page: redirect authenticated users to the dashboard,
 * unauthenticated users to the login page.
 */
export default async function RootPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.id) {
    redirect('/dashboard')
  }

  redirect('/login')
}
