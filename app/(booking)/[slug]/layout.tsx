import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

const BUSINESS_LABELS: Record<string, string> = {
  salao: 'Salão de Beleza', barbearia: 'Barbearia', clinica: 'Clínica',
  dentista: 'Dentista', psicologo: 'Psicólogo', estetica: 'Estética',
  massagem: 'Massagem', nutricionista: 'Nutricionista',
  fisioterapia: 'Fisioterapia', personal: 'Personal Trainer', outros: 'Profissional',
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const p = await prisma.professional.findUnique({
    where: { slug: params.slug },
    select: {
      businessName: true, bio: true, city: true, state: true,
      image: true, businessType: true, address: true,
    },
  })

  if (!p) {
    return { title: 'Profissional não encontrado | Markou' }
  }

  const type   = BUSINESS_LABELS[p.businessType ?? ''] ?? 'Profissional'
  const loc    = [p.city, p.state].filter(Boolean).join(', ')
  const title  = `${p.businessName} – ${type}${loc ? ` em ${loc}` : ''} | Markou`
  const desc   = p.bio?.slice(0, 160)
    ?? `Agende com ${p.businessName} online. ${type}${loc ? ` em ${loc}` : ''}. Reserve seu horário pelo Markou, rápido e sem precisar ligar.`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'profile',
      locale: 'pt_BR',
      ...(p.image ? { images: [{ url: p.image, alt: p.businessName ?? 'Foto do profissional' }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description: desc },
  }
}

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const p = await prisma.professional.findUnique({
    where: { slug: params.slug },
    select: {
      businessName: true, bio: true, city: true, state: true,
      address: true, addressNumber: true, zipCode: true,
      phone: true, image: true, businessType: true,
      reviews: { select: { rating: true } },
      services: { where: { active: true }, select: { price: true } },
    },
  })

  let jsonLd: object | null = null

  if (p) {
    const type  = BUSINESS_LABELS[p.businessType ?? ''] ?? 'ProfessionalService'
    const loc   = [p.city, p.state].filter(Boolean).join(', ')
    const base  = process.env.NEXTAUTH_URL ?? 'https://markou.app'
    const url   = `${base}/${params.slug}`
    const avgRating = p.reviews.length > 0
      ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
      : null
    const prices = p.services.map(s => s.price).filter(Boolean)
    const minPrice = prices.length > 0 ? Math.min(...prices) : null

    jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: p.businessName,
      description: p.bio ?? `${type}${loc ? ` em ${loc}` : ''}`,
      url,
      ...(p.image ? { image: p.image } : {}),
      ...(p.phone ? { telephone: p.phone } : {}),
      ...(p.address ? {
        address: {
          '@type': 'PostalAddress',
          streetAddress: [p.address, p.addressNumber].filter(Boolean).join(', '),
          addressLocality: p.city ?? undefined,
          addressRegion: p.state ?? undefined,
          postalCode: p.zipCode ?? undefined,
          addressCountry: 'BR',
        },
      } : {}),
      ...(minPrice !== null ? { priceRange: `A partir de R$${minPrice}` } : {}),
      ...(avgRating !== null && p.reviews.length >= 3 ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avgRating.toFixed(1),
          reviewCount: p.reviews.length,
          bestRating: 5,
          worstRating: 1,
        },
      } : {}),
      makesOffer: p.services.map(s => ({
        '@type': 'Offer',
        price: s.price,
        priceCurrency: 'BRL',
      })),
    }
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
