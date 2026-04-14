import { withAuth } from 'next-auth/middleware'

// Avec strategy:'jwt', withAuth fonctionne correctement car
// il peut vérifier le token JWT directement sans appel DB
export default withAuth({
  callbacks: {
    authorized({ token }) {
      return !!token
    },
  },
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/agenda/:path*',
    '/clientes/:path*',
    '/servicos/:path*',
    '/configuracoes/:path*',
    '/relatorios/:path*',
    '/assinatura/:path*',
    '/onboarding',
  ],
}
