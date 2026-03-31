import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'

// Monta a lista de providers dinamicamente com base nas env vars disponíveis
function buildProviders() {
  const providers = []

  // Google OAuth — só ativo se as credenciais estiverem configuradas
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    )
  }

  // Magic link por e-mail — só ativo se RESEND_API_KEY estiver configurada
  if (process.env.RESEND_API_KEY) {
    providers.push(
      EmailProvider({
        server: {
          host: 'smtp.resend.com',
          port: 465,
          auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY,
          },
        },
        from: process.env.EMAIL_FROM ?? 'AgendaFácil <onboarding@resend.dev>',
      })
    )
  }

  // Provider de desenvolvimento — APENAS em ambiente local/preview (nunca em produção)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEV_LOGIN === 'true') {
    providers.push(
      CredentialsProvider({
        id: 'dev-login',
        name: 'Dev Login',
        credentials: {
          email: { label: 'Email', type: 'email' },
        },
        async authorize(credentials) {
          if (!credentials?.email) return null

          // Busca ou cria o profissional pelo e-mail
          let professional = await prisma.professional.findUnique({
            where: { email: credentials.email },
          })

          if (!professional) {
            professional = await prisma.professional.create({
              data: { email: credentials.email },
            })
          }

          return {
            id: professional.id,
            email: professional.email,
            name: professional.name || professional.email,
          }
        },
      })
    )
  }

  return providers
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: buildProviders(),
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        const professional = await prisma.professional.findUnique({
          where: { id: user.id },
          select: { plan: true, slug: true, businessName: true, businessType: true },
        })
        if (professional) {
          session.user.plan = professional.plan
          session.user.slug = professional.slug ?? undefined
          session.user.businessName = professional.businessName
          session.user.businessType = professional.businessType
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verificar-email',
    newUser: '/onboarding',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
