/**
 * One-time migration: marks all professionals without a password as isDemo=true.
 * Seed companies are created without passwords; real registered users have bcrypt hashes.
 *
 * Run: npm run db:mark-demo
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔖 Marking seed (passwordless) professionals as isDemo=true...')

  const result = await prisma.professional.updateMany({
    where: { password: null },
    data: { isDemo: true },
  })

  console.log(`✅ Updated ${result.count} professionals.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
