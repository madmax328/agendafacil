import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSlug } from '@/lib/utils'
import { z } from 'zod'

const onboardingSchema = z.object({
  businessName: z.string().min(1),
  businessType: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  services: z
    .array(
      z.object({
        name: z.string().min(1),
        duration: z.number().min(15),
        price: z.number().min(0),
      })
    )
    .min(1),
  availability: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      active: z.boolean(),
    })
  ),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()

  const parseResult = onboardingSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parseResult.error.flatten() },
      { status: 422 }
    )
  }

  const data = parseResult.data
  const slug = await generateUniqueSlug(data.businessName)

  await prisma.$transaction(async (tx) => {
    await tx.professional.update({
      where: { id: session.user.id },
      data: {
        businessName: data.businessName,
        businessType: data.businessType,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        slug,
      },
    })

    await tx.service.createMany({
      data: data.services.map((s) => ({
        ...s,
        professionalId: session.user.id,
      })),
    })

    const activeAvailability = data.availability.filter((a) => a.active)
    if (activeAvailability.length > 0) {
      await tx.availability.createMany({
        data: activeAvailability.map((a) => ({
          professionalId: session.user.id,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        })),
      })
    }
  })

  return NextResponse.json({ success: true })
}

async function generateUniqueSlug(businessName: string): Promise<string> {
  let slug = generateSlug(businessName)
  let counter = 1
  while (true) {
    const existing = await prisma.professional.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${generateSlug(businessName)}-${counter}`
    counter++
  }
}
