'use client'

import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const errorParam = searchParams.get('error')

  // Show error from NextAuth redirect
  const authErrorMessages: Record<string, string> = {
    OAuthSignin: 'Erro ao iniciar autenticação com Google.',
    OAuthCallback: 'Erro ao concluir autenticação com Google.',
    OAuthCreateAccount: 'Não foi possível criar a conta com Google.',
    EmailCreateAccount: 'Não foi possível criar a conta com e-mail.',
    Callback: 'Erro durante o retorno de autenticação.',
    OAuthAccountNotLinked:
      'Este e-mail já está vinculado a outra forma de acesso.',
    EmailSignin: 'Não foi possível enviar o e-mail de acesso.',
    CredentialsSignin: 'Credenciais inválidas. Tente novamente.',
    Default: 'Ocorreu um erro ao fazer login. Tente novamente.',
  }

  const errorMessage = errorParam
    ? (authErrorMessages[errorParam] ?? authErrorMessages.Default)
    : null

  async function handleGoogleSignIn() {
    try {
      setLoadingGoogle(true)
      await signIn('google', { callbackUrl })
    } catch {
      toast({
        title: 'Erro ao entrar com Google',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      })
      setLoadingGoogle(false)
    }
  }

  async function handleEmailSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: 'E-mail obrigatório',
        description: 'Por favor, informe seu endereço de e-mail.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoadingEmail(true)
      const result = await signIn('email', {
        email: email.trim().toLowerCase(),
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        toast({
          title: 'Erro ao enviar e-mail',
          description:
            'Não foi possível enviar o link de acesso. Verifique o e-mail e tente novamente.',
          variant: 'destructive',
        })
        setLoadingEmail(false)
        return
      }

      router.push('/verificar-email')
    } catch {
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      })
      setLoadingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="bg-white/20 rounded-xl p-2">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                AgendaFácil
              </h1>
            </div>
            <p className="text-blue-100 text-sm mt-1">
              Sua agenda profissional online
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Bem-vindo de volta!
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Acesse sua conta para gerenciar sua agenda
              </p>
            </div>

            {/* Auth error banner */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Google sign-in */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 gap-3 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              onClick={handleGoogleSignIn}
              disabled={loadingGoogle || loadingEmail}
            >
              {loadingGoogle ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span className="font-medium">Entrar com Google</span>
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                ou
              </span>
              <Separator className="flex-1" />
            </div>

            {/* Email magic-link form */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Endereço de e-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                    autoComplete="email"
                    disabled={loadingGoogle || loadingEmail}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                disabled={loadingGoogle || loadingEmail}
              >
                {loadingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enviando link...
                  </>
                ) : (
                  'Entrar com e-mail'
                )}
              </Button>
            </form>

            {/* Footer note */}
            <p className="text-xs text-center text-gray-400 leading-relaxed">
              Ao entrar, você concorda com nossos{' '}
              <a
                href="/termos"
                className="text-blue-600 hover:underline font-medium"
              >
                Termos de Uso
              </a>{' '}
              e{' '}
              <a
                href="/privacidade"
                className="text-blue-600 hover:underline font-medium"
              >
                Política de Privacidade
              </a>
              .
            </p>
          </div>
        </div>

        {/* Sign-up nudge */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Ainda não tem conta?{' '}
          <a
            href="/cadastro"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Crie uma gratuitamente
          </a>
        </p>
      </div>
    </div>
  )
}

/** Inline SVG for the Google "G" logo */
function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}
