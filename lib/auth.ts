import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from '@/lib/prisma'
import type { Plan } from '@prisma/client'

// Adapter customizado: usa o PrismaAdapter mas sobrescreve createUser
// para garantir compatibilidade com o modelo Professional
function buildAdapter() {
  const adapter = PrismaAdapter(prisma) as any

  // PrismaAdapter espera um modelo User genérico. Sobrescrevemos createUser
  // para passar apenas os campos que Professional aceita.
  adapter.createUser = async (user: {
    email: string
    name?: string | null
    image?: string | null
    emailVerified?: Date | null
  }) => {
    return prisma.professional.create({
      data: {
        email: user.email,
        name: user.name ?? '',
        image: user.image ?? null,
        emailVerified: user.emailVerified ?? null,
      },
    })
  }

  return adapter
}

export const authOptions: NextAuthOptions = {
  adapter: buildAdapter(),

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
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id
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
