import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ProfessionalAdapter } from '@/lib/auth-adapter'
import type { Plan } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: ProfessionalAdapter(),

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
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const professional = await prisma.professional.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: { id: true, email: true, name: true, image: true, password: true },
        })
        if (!professional?.password) return null
        const valid = await bcrypt.compare(credentials.password, professional.password)
        if (!valid) return null
        return { id: professional.id, email: professional.email, name: professional.name, image: professional.image }
      },
    }),
  ],

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },

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
