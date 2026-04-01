import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from '@/lib/prisma'
import type { Plan } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  // Sem PrismaAdapter — criação de usuário feita manualmente no signIn callback
  // Isso evita incompatibilidades entre @auth/prisma-adapter v1 e next-auth v4
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    ...(process.env.RESEND_API_KEY
      ? [EmailProvider({
          server: {
            host: 'smtp.resend.com',
            port: 465,
            auth: { user: 'resend', pass: process.env.RESEND_API_KEY },
          },
          from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
        })]
      : []),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      try {
        // Busca ou cria o profissional pelo e-mail
        const existing = await prisma.professional.findUnique({
          where: { email: user.email },
        })

        if (!existing) {
          const created = await prisma.professional.create({
            data: {
              email: user.email,
              name: user.name ?? '',
              image: user.image ?? null,
            },
          })
          // Atualiza o ID do user para o ID criado no banco
          user.id = created.id
        } else {
          user.id = existing.id
        }

        return true
      } catch (err) {
        console.error('[NextAuth] Erro no signIn:', err)
        return false
      }
    },

    async jwt({ token, user }) {
      // Na primeira autenticação o user está presente
      if (user?.id) {
        token.id = user.id
      }
      // Se o token já tem id, re-usa (chamadas subsequentes)
      if (!token.id && token.email) {
        const pro = await prisma.professional.findUnique({
          where: { email: token.email as string },
          select: { id: true },
        })
        if (pro) token.id = pro.id
      }
      return token
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string

        const pro = await prisma.professional.findUnique({
          where: { id: token.id as string },
          select: { plan: true, slug: true, businessName: true, businessType: true },
        })

        if (pro) {
          session.user.plan = pro.plan as Plan
          session.user.slug = pro.slug ?? undefined
          session.user.businessName = pro.businessName
          session.user.businessType = pro.businessType
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
