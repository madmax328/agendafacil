import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from '@/lib/prisma'
import type { Plan } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })]
      : []),
    EmailProvider({
      server: {
        host: 'smtp.resend.com',
        port: 465,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY ?? '',
        },
      },
      from: process.env.EMAIL_FROM ?? 'onboarding@resend.dev',
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
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
