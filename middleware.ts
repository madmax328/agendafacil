import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, UserRole } from '@/lib/auth'

const PROTECTED: Record<string, UserRole> = {
  '/admin': 'admin',
  '/cuisine': 'cuisine',
  '/boulangerie': 'boulangerie',
  '/pizzeria': 'pizzeria',
  '/cafeteria': 'cafeteria',
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === '/' || pathname === '/login' || pathname === '/setup') {
    const session = await getSessionFromRequest(req)
    if (session && (pathname === '/login' || pathname === '/')) {
      const dest = session.role === 'admin' ? '/admin'
        : session.role === 'cafeteria' ? '/cafeteria'
        : `/${session.role}`
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  for (const [prefix, role] of Object.entries(PROTECTED)) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      const session = await getSessionFromRequest(req)
      if (!session) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      if (session.role !== role) {
        const dest = session.role === 'admin' ? '/admin'
          : session.role === 'cafeteria' ? '/cafeteria'
          : `/${session.role}`
        return NextResponse.redirect(new URL(dest, req.url))
      }
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
