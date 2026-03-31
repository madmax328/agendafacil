import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from '@/lib/prisma'

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
        // Busca dados extras do profissional para enriquecer a sessão
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
    // Novos usuários são redirecionados para o onboarding
    newUser: '/onboarding',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
