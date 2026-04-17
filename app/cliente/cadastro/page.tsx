'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, Calendar, ArrowLeft, User, Phone } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

export default function ClienteCadastroPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !password) return
    if (password !== confirmPassword) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'A senha deve ter pelo menos 6 caracteres', variant: 'destructive' })
      return
    }
    try {
      setLoading(true)
      const res = await fetch('/api/cliente/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error || 'Erro ao criar conta', variant: 'destructive' })
        setLoading(false)
        return
      }

      // Auto login after registration
      const loginRes = await fetch('/api/cliente/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      if (loginRes.ok) {
        router.push('/cliente/reservas')
      } else {
        toast({ title: 'Conta criada! Faça login.', description: 'Vá para a página de login.' })
        router.push('/cliente/login')
      }
    } catch {
      toast({ title: 'Erro ao criar conta', variant: 'destructive' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-xl border border-gray-200 dark:border-[#30363d] overflow-hidden">
          <div className="bg-gray-900 dark:bg-[#21262d] px-8 py-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-white/20 rounded-xl p-2">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Markou</h1>
            </div>
            <p className="text-gray-400 text-sm mt-1">Crie sua conta de cliente</p>
          </div>
          <div className="px-8 py-8 space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">Cadastrar</h2>
              <p className="text-sm text-gray-500 mt-1">Gerencie seus agendamentos em um só lugar</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Nome completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="tel" placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} required disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} minLength={6}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="password" placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required disabled={loading}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500">
              Já tem conta?{' '}
              <Link href="/cliente/login" className="text-blue-600 font-medium hover:underline">Entrar</Link>
            </p>
            <div className="text-center">
              <Link href="/" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                <ArrowLeft className="h-3 w-3" />Voltar para o início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
