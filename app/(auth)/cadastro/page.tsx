'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, Calendar, ArrowLeft, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'

function CadastroForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const callbackUrl = searchParams.get('callbackUrl') ?? '/onboarding'

  async function handleGoogleSignUp() {
    try {
      setLoadingGoogle(true)
      await signIn('google', { callbackUrl })
    } catch {
      toast({ title: 'Erro ao entrar com Google', description: 'Tente novamente.', variant: 'destructive' })
      setLoadingGoogle(false)
    }
  }

  async function handleEmailSignUp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) return
    if (password !== confirmPassword) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'A senha deve ter pelo menos 6 caracteres', variant: 'destructive' })
      return
    }
    try {
      setLoadingEmail(true)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: data.error || 'Erro ao criar conta', variant: 'destructive' })
        setLoadingEmail(false)
        return
      }
      // Auto login after registration
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      })
      if (result?.error) {
        toast({ title: 'Conta criada! Faça login.', description: 'Vá para a página de login.' })
        router.push('/login')
      } else {
        router.push(callbackUrl)
      }
    } catch {
      toast({ title: 'Erro ao criar conta', variant: 'destructive' })
      setLoadingEmail(false)
    }
  }

  return (
    <div className="px-8 py-8 space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Crie sua conta grátis</h2>
        <p className="text-sm text-gray-500 mt-1">Sem cartão de crédito • Setup em 10 minutos</p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-11 gap-3 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
        onClick={handleGoogleSignUp}
        disabled={loadingGoogle || loadingEmail}
      >
        {loadingGoogle ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        <span className="font-medium">Cadastrar com Google</span>
      </Button>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">ou</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleEmailSignUp} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-gray-700 font-medium">Nome completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-9 h-11 border-gray-200"
              autoComplete="name"
              disabled={loadingGoogle || loadingEmail}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-gray-700 font-medium">Seu melhor e-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9 h-11 border-gray-200"
              autoComplete="email"
              disabled={loadingGoogle || loadingEmail}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-gray-700 font-medium">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 h-11 border-gray-200"
              autoComplete="new-password"
              disabled={loadingGoogle || loadingEmail}
              required
              minLength={6}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirmar senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9 h-11 border-gray-200"
              autoComplete="new-password"
              disabled={loadingGoogle || loadingEmail}
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={loadingGoogle || loadingEmail}
        >
          {loadingEmail
            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Criando conta...</>
            : 'Criar conta'}
        </Button>
      </form>

      <p className="text-xs text-center text-gray-400 leading-relaxed">
        Ao criar sua conta, você concorda com nossos{' '}
        <a href="/termos" className="text-blue-600 hover:underline">Termos de Uso</a>{' '}
        e{' '}
        <a href="/privacidade" className="text-blue-600 hover:underline">Política de Privacidade</a>.
      </p>
    </div>
  )
}

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-white/20 rounded-xl p-2">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Markou</h1>
            </div>
            <p className="text-blue-100 text-sm mt-1">Comece a usar de graça hoje mesmo</p>
          </div>
          <Suspense fallback={<div className="px-8 py-8 text-center text-gray-400">Carregando...</div>}>
            <CadastroForm />
          </Suspense>
        </div>
        <div className="text-center text-sm text-gray-500 mt-6 space-y-2">
          <p>
            Já tem uma conta?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">Entrar</Link>
          </p>
          <Link href="/" className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs">
            <ArrowLeft className="h-3 w-3" />Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}
