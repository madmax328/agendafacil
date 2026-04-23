import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? 'https://www.markou.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/agenda',
          '/clientes',
          '/configuracoes',
          '/financeiro',
          '/api/',
          '/cliente/reservas',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
