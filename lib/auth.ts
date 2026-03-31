import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import type { Plan } from '@prisma/client'

function buildProviders() {
  const providers = []

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    )
  }

  if (process.env.RESEND_API_KEY) {
    providers.push(
      EmailProvider({
        server: {
          host: 'smtp.resend.com',
          port: 465,
          auth: { user: 'resend', pass: process.env.RESEND_API_KEY },
        },
        from: process.env.EMAIL_FROM ?? 'AgendaFácil <onboarding@resend.dev>',
      })
    )
  }

  // Provider de teste — ativo se ENABLE_DEV_LOGIN=true
  if (process.env.ENABLE_DEV_LOGIN === 'true') {
    providers.push(
      CredentialsProvider({
        id: 'dev-login',
        name: 'Dev Login',
        credentials: {
          email: { label: 'Email', type: 'email' },
        },
        async authorize(credentials) {
          if (!credentials?.email) return null

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
            name: professional.name || credentials.email,
          }
        },
      })
    )
  }

  return providers
}

export const authOptions: NextAuthOptions = {
  // PrismaAdapter cria os usuários na DB — sessions ficam no JWT
  adapter: PrismaAdapter(prisma) as any,
  providers: buildProviders(),
  // JWT permite o CredentialsProvider funcionar + OAuth/Email
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      // Na primeira autenticação, user está preenchido
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string

        const professional = await prisma.professional.findUnique({
          where: { id: token.id as string },
          select: { plan: true, slug: true, businessName: true, businessType: true },
        })

        if (professional) {
          session.user.plan = professional.plan as Plan
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
  secret: process.env.NEXTAUTH_SECRET,
}
