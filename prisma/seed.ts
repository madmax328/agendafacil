import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminExists = await prisma.admin.count()
  if (adminExists === 0) {
    await prisma.admin.create({
      data: {
        email: 'admin@artigus.ch',
        password: await bcrypt.hash('admin123', 10),
      },
    })
    console.log('Admin créé: admin@artigus.ch / admin123')
  }

  const units: { type: 'CUISINE' | 'BOULANGERIE' | 'PIZZERIA'; name: string }[] = [
    { type: 'CUISINE', name: 'Cuisine' },
    { type: 'BOULANGERIE', name: 'Boulangerie' },
    { type: 'PIZZERIA', name: 'Pizzeria' },
  ]

  for (const u of units) {
    await prisma.productionUnit.upsert({
      where: { type: u.type },
      update: {},
      create: { type: u.type, name: u.name, password: await bcrypt.hash('1234', 10) },
    })
    console.log(`Unité ${u.name} créée (mot de passe: 1234)`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
