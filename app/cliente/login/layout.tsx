import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar na Minha Conta',
  description: 'Acesse sua conta de cliente no Markou e visualize e gerencie seus agendamentos online.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
