import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Markou – Agendamento Online para Profissionais',
    template: '%s | Markou',
  },
  description:
    'Simplifique sua agenda. Aceite agendamentos online 24h, envie lembretes automáticos e gerencie seus clientes com facilidade.',
  keywords: [
    'agendamento online',
    'agenda profissional',
    'reservas online',
    'salão de beleza',
    'clínica',
    'gestão de clientes',
  ],
  authors: [{ name: 'Markou' }],
  creator: 'Markou',
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? 'https://markou.app'
  ),
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://markou.app',
    siteName: 'Markou',
    title: 'Markou – Agendamento Online para Profissionais',
    description:
      'Simplifique sua agenda. Aceite agendamentos online 24h, envie lembretes automáticos e gerencie seus clientes com facilidade.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markou – Agendamento Online para Profissionais',
    description:
      'Simplifique sua agenda. Aceite agendamentos online 24h, envie lembretes automáticos e gerencie seus clientes com facilidade.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
