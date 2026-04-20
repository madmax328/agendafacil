import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Criar Conta de Cliente',
  description: 'Crie sua conta gratuita no Markou e agende serviços com profissionais online. Gerencie todos os seus agendamentos em um só lugar.',
}

export default function CadastroLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
