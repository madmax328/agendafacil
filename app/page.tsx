import { redirect } from 'next/navigation'

// Redireciona sempre para o login — a verificação de sessão
// acontece no middleware e nos layouts de cada seção.
export default function RootPage() {
  redirect('/login')
}
