import { NextRequest, NextResponse } from 'next/server'

// Routes protégées — nécessitent une session active
const protectedPaths = [
  '/dashboard',
  '/agenda',
  '/clientes',
  '/servicos',
  '/configuracoes',
  '/assinatura',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  // NextAuth avec strategy: 'database' utilise un cookie de session (pas JWT)
  const sessionToken =
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value

  if (!sessionToken) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agenda/:path*',
    '/clientes/:path*',
    '/servicos/:path*',
    '/configuracoes/:path*',
    '/assinatura/:path*',
  ],
}
