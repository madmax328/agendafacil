// Adapter NextAuth customizado que usa o modelo Professional
// em vez do modelo User padrão esperado pelo PrismaAdapter
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from 'next-auth/adapters'
import { prisma } from '@/lib/prisma'

export function ProfessionalAdapter(): Adapter {
  return {
    // ── Usuário ──────────────────────────────────────────────
    async createUser(user: AdapterUser) {
      return prisma.professional.create({
        data: {
          email: user.email,
          name: user.name ?? '',
          image: user.image ?? null,
          emailVerified: user.emailVerified ?? null,
        },
      }) as any
    },

    async getUser(id) {
      return (await prisma.professional.findUnique({ where: { id } })) as any
    },

    async getUserByEmail(email) {
      return (await prisma.professional.findUnique({ where: { email } })) as any
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      })
      return (account?.user ?? null) as any
    },

    async updateUser({ id, ...data }) {
      return prisma.professional.update({ where: { id }, data }) as any
    },

    async deleteUser(id) {
      await prisma.professional.delete({ where: { id } })
    },

    // ── Contas OAuth ─────────────────────────────────────────
    async linkAccount(account: AdapterAccount) {
      await prisma.account.create({ data: account as any })
    },

    async unlinkAccount({ provider, providerAccountId }: Pick<AdapterAccount, 'provider' | 'providerAccountId'>) {
      await prisma.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      })
    },

    // ── Sessões (não usadas com strategy:'jwt') ───────────────
    async createSession(session: AdapterSession) {
      return prisma.session.create({ data: session }) as any
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (!session) return null
      return { session: session as any, user: session.user as any }
    },

    async updateSession({ sessionToken, ...data }: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>) {
      return prisma.session.update({
        where: { sessionToken },
        data,
      }) as any
    },

    async deleteSession(sessionToken: string) {
      await prisma.session.delete({ where: { sessionToken } })
    },

    // ── Tokens de verificação (magic link) ────────────────────
    async createVerificationToken(verificationToken: VerificationToken) {
      return prisma.verificationToken.create({ data: verificationToken }) as any
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      try {
        return await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        }) as any
      } catch {
        // Token já usado ou expirado
        return null
      }
    },
  }
}
