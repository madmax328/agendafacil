import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

const FIXED_ROLES: Record<string, string> = {
  '/admin': 'admin',
  '/cafeteria': 'cafeteria',
}

function homeFor(role: string) {
  if (role === 'admin') return '/admin'
  if (role === 'cafeteria') return '/cafeteria'
  return `/${role}`
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public paths
  if (pathname === '/' || pathname === '/login' || pathname === '/setup') {
    const session = await getSessionFromRequest(req)
    if (session && pathname !== '/setup') {
      return NextResponse.redirect(new URL(homeFor(session.role), req.url))
    }
    return NextResponse.next()
  }

  // Skip static assets
  if (pathname.includes('.')) return NextResponse.next()

  // Fixed role paths (admin, cafeteria)
  for (const [prefix, role] of Object.entries(FIXED_ROLES)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      const session = await getSessionFromRequest(req)
      if (!session) return NextResponse.redirect(new URL('/login', req.url))
      if (session.role !== role) return NextResponse.redirect(new URL(homeFor(session.role), req.url))
      return NextResponse.next()
    }
  }

  // Dynamic production unit paths: /{unitSlug}/...
  const segment = pathname.split('/')[1]
  if (segment) {
    const session = await getSessionFromRequest(req)
    if (!session) return NextResponse.redirect(new URL('/login', req.url))
    if (session.role !== segment) return NextResponse.redirect(new URL(homeFor(session.role), req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
