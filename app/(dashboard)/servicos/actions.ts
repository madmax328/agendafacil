'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  duration: z.number().min(15, 'Duração mínima é 15 minutos'),
  price: z.number().min(0, 'Preço deve ser positivo'),
  description: z.string().optional(),
})

export async function createService(data: z.infer<typeof serviceSchema>) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autorizado')

  const validated = serviceSchema.parse(data)

  const service = await prisma.service.create({
    data: {
      ...validated,
      professionalId: session.user.id,
    },
  })

  revalidatePath('/servicos')
  return service
}

export async function updateService(
  id: string,
  data: Partial<z.infer<typeof serviceSchema>>,
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autorizado')

  const service = await prisma.service.update({
    where: { id, professionalId: session.user.id },
    data,
  })

  revalidatePath('/servicos')
  return service
}

export async function deleteService(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autorizado')

  await prisma.service.delete({
    where: { id, professionalId: session.user.id },
  })

  revalidatePath('/servicos')
}

export async function toggleServiceStatus(id: string, active: boolean) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Não autorizado')

  await prisma.service.update({
    where: { id, professionalId: session.user.id },
    data: { active },
  })

  revalidatePath('/servicos')
}
