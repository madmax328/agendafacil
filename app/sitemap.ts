import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? 'https://www.markou.app'

  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                         lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/para-profissionais`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/profissionais`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/termos`,             lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/privacidade`,        lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  try {
    const professionals = await prisma.professional.findMany({
      where: { slug: { not: null }, isDemo: false },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    const proPages: MetadataRoute.Sitemap = professionals
      .filter(p => p.slug)
      .map(p => ({
        url: `${base}/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

    return [...staticPages, ...proPages]
  } catch {
    return staticPages
  }
}
