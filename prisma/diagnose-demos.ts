/**
 * Diagnostic script: audits the current state of demo professionals and
 * any appointments linked to them.
 *
 * Run: npx tsx prisma/diagnose-demos.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n=== DEMO DIAGNOSTIC REPORT ===\n')

  // --- Block 1: Professional counts ---
  const totalPros = await prisma.professional.count()
  const passwordless = await prisma.professional.count({ where: { password: null } })
  const withPassword = await prisma.professional.count({ where: { password: { not: null } } })
  const alreadyDemo = await prisma.professional.count({ where: { isDemo: true } })

  console.log('--- Professionals ---')
  console.log(`Total professionals:   ${totalPros}`)
  console.log(`With password (real):  ${withPassword}`)
  console.log(`Passwordless (seeds):  ${passwordless}`)
  console.log(`Already isDemo=true:   ${alreadyDemo}`)

  // --- Block 2: Sample of passwordless pros ---
  const samples = await prisma.professional.findMany({
    where: { password: null },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      businessName: true,
      city: true,
      businessType: true,
      isDemo: true,
      createdAt: true,
    },
  })

  console.log('\n--- Sample of 5 passwordless professionals (newest first) ---')
  samples.forEach((p, i) => {
    console.log(
      `  ${i + 1}. ${p.businessName || '(no name)'} | ${p.city} | ${p.businessType} | isDemo=${p.isDemo} | ${p.email} | created ${p.createdAt.toISOString()}`
    )
  })

  // --- Block 3: Appointments linked to passwordless pros ---
  const demoApptCount = await prisma.appointment.count({
    where: { professional: { password: null } },
  })

  console.log('\n--- Appointments on passwordless professionals ---')
  console.log(`Total:  ${demoApptCount}`)

  if (demoApptCount > 0) {
    const details = await prisma.appointment.findMany({
      where: { professional: { password: null } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
        professional: { select: { slug: true, businessName: true } },
        customer: { select: { name: true, email: true } },
      },
    })

    console.log('  (showing up to 10 most recent)')
    details.forEach((a, i) => {
      console.log(
        `  ${i + 1}. [${a.status}] ${a.professional.businessName} (/${a.professional.slug}) — customer: ${a.customer.name} / ${a.customer.email} — scheduled ${a.scheduledAt.toISOString()} — created ${a.createdAt.toISOString()}`
      )
    })
  }

  // --- Block 4: isDemo=true appointments (already marked) ---
  const markedDemoAppts = await prisma.appointment.count({
    where: { professional: { isDemo: true } },
  })

  console.log('\n--- Appointments on already-marked isDemo=true professionals ---')
  console.log(`Total:  ${markedDemoAppts}`)

  console.log('\n=== END OF REPORT ===\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
