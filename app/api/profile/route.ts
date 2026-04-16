import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const updateProfileSchema = z.object({
  businessName: z.string().min(1).optional(),
  businessType: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  addressNumber: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pixKey: z.string().optional(),
  bio: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const professional = await prisma.professional.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      businessName: true,
      businessType: true,
      phone: true,
      address: true,
      addressNumber: true,
      zipCode: true,
      city: true,
      state: true,
      pixKey: true,
      bio: true,
      slug: true,
      plan: true,
    },
  })

  if (!professional) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  return NextResponse.json(professional)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  let data: z.infer<typeof updateProfileSchema>
  try {
    data = updateProfileSchema.parse(body)
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: err.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
  }

  const updated = await prisma.professional.update({
    where: { id: session.user.id },
    data,
    select: {
      businessName: true,
      businessType: true,
      phone: true,
      address: true,
      addressNumber: true,
      zipCode: true,
      city: true,
      state: true,
      pixKey: true,
      bio: true,
    },
  })

  return NextResponse.json(updated)
}
