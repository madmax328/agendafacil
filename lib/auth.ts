import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: 'smtp.resend.com',
        port: 465,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: 'AgendaFácil <noreply@agendafacil.com.br>',
    }),
  ],
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
          session.user.slug = professional.slug
          session.user.businessName = professional.businessName
          session.user.businessType = professional.businessType
        }
      }
      return session
    },
    async signIn({ user, account }) {
      if (!user.email) return false
      // Create professional profile if it doesn't exist (for OAuth)
      if (account?.provider === 'google') {
        const existing = await prisma.professional.findUnique({
          where: { email: user.email },
        })
        if (!existing) {
          const slug = generateSlug(user.name || user.email.split('@')[0])
          const uniqueSlug = await ensureUniqueSlug(slug)
          await prisma.professional.create({
            data: {
              id: user.id,
              email: user.email,
              name: user.name || '',
              slug: uniqueSlug,
              businessName: user.name || '',
              businessType: 'outros',
            },
          })
        }
      }
      return true
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

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1
  while (true) {
    const existing = await prisma.professional.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${baseSlug}-${counter}`
    counter++
  }
}
