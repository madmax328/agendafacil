'use client'

import { type ReactNode, useState, useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  MessageCircle,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

// ── Types ──────────────────────────────────────────────────────────────────────

type TabId = 'perfil' | 'whatsapp' | 'disponibilidade'

interface Tab {
  id: TabId
  label: string
  icon: ReactNode
}

const BUSINESS_TYPES = [
  { value: 'salao', label: 'Salão de Beleza' },
  { value: 'barbearia', label: 'Barbearia' },
  { value: 'clinica', label: 'Clínica Estética' },
  { value: 'dentista', label: 'Dentista' },
  { value: 'psicologo', label: 'Psicólogo(a)' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta' },
  { value: 'nutricionista', label: 'Nutricionista' },
  { value: 'personal', label: 'Personal Trainer' },
  { value: 'manicure', label: 'Manicure/Pedicure' },
  { value: 'outros', label: 'Outros' },
]

const DAYS_OF_WEEK = [
  { day: 0, label: 'Domingo' },
  { day: 1, label: 'Segunda-feira' },
  { day: 2, label: 'Terça-feira' },
  { day: 3, label: 'Quarta-feira' },
  { day: 4, label: 'Quinta-feira' },
  { day: 5, label: 'Sexta-feira' },
  { day: 6, label: 'Sábado' },
]

const STATES_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

// ── Zod schemas ────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  businessName: z.string().min(1, 'Nome do negócio é obrigatório'),
  businessType: z.string().min(1, 'Selecione o tipo'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pixKey: z.string().optional(),
})

const whatsappSchema = z.object({
  whatsappToken: z.string().optional(),
  zapiInstanceId: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>
type WhatsappFormData = z.infer<typeof whatsappSchema>

interface AvailabilityRow {
  dayOfWeek: number
  active: boolean
  startTime: string
  endTime: string
}

// ── Perfil Tab ─────────────────────────────────────────────────────────────────

function PerfilTab() {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        reset(data)
      }
    }
    load()
  }, [reset])

  function onSubmit(data: ProfileFormData) {
    startTransition(async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error()
        toast({ title: 'Perfil salvo com sucesso!' })
      } catch {
        toast({ title: 'Erro ao salvar perfil', variant: 'destructive' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="text-base font-semibold text-gray-900">Informações do Negócio</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="businessName" className="text-gray-700 font-medium">
              Nome do negócio <span className="text-red-500">*</span>
            </Label>
            <Input
              id="businessName"
              placeholder="Ex: Studio Beleza Silva"
              {...register('businessName')}
              className={errors.businessName ? 'border-red-400' : ''}
            />
            {errors.businessName && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.businessName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessType" className="text-gray-700 font-medium">
              Tipo de negócio <span className="text-red-500">*</span>
            </Label>
            <select
              id="businessType"
              {...register('businessType')}
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">Selecione...</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-gray-700 font-medium">
              Telefone
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register('phone')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pixKey" className="text-gray-700 font-medium">
              Chave Pix
            </Label>
            <Input
              id="pixKey"
              placeholder="CPF, CNPJ, e-mail ou telefone"
              {...register('pixKey')}
            />
          </div>
        </div>

        <h3 className="text-base font-semibold text-gray-900 pt-2">Endereço</h3>

        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-gray-700 font-medium">
            Endereço completo
          </Label>
          <Input
            id="address"
            placeholder="Rua, número, complemento, bairro"
            {...register('address')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-gray-700 font-medium">
              Cidade
            </Label>
            <Input
              id="city"
              placeholder="São Paulo"
              {...register('city')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-gray-700 font-medium">
              Estado
            </Label>
            <select
              id="state"
              {...register('state')}
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">UF</option>
              {STATES_BR.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar perfil
        </Button>
      </div>
    </form>
  )
}

// ── WhatsApp Tab ───────────────────────────────────────────────────────────────

function WhatsAppTab() {
  const [isPending, startTransition] = useTransition()
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')
  const [connectionDetail, setConnectionDetail] = useState<string>('')
  const [checkingStatus, setCheckingStatus] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WhatsappFormData>({ resolver: zodResolver(whatsappSchema) })

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        reset({ whatsappToken: data.whatsappToken ?? '', zapiInstanceId: data.zapiInstanceId ?? '' })
      }
    }
    load()
  }, [reset])

  async function checkConnection() {
    setCheckingStatus(true)
    try {
      const res = await fetch('/api/whatsapp/status')
      const data = await res.json()
      if (data.connected) {
        setConnectionStatus('connected')
        setConnectionDetail(data.session ? `Sessão: ${data.session}` : 'WhatsApp conectado e funcionando')
      } else {
        setConnectionStatus('disconnected')
        setConnectionDetail(data.reason ?? 'Não foi possível conectar')
      }
    } catch {
      setConnectionStatus('disconnected')
      setConnectionDetail('Erro de rede ao verificar status')
    } finally {
      setCheckingStatus(false)
    }
  }

  function onSubmit(data: WhatsappFormData) {
    startTransition(async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            whatsappToken: data.whatsappToken ?? '',
            zapiInstanceId: data.zapiInstanceId ?? '',
          }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error ?? 'Erro desconhecido')
        }
        toast({ title: 'Credenciais WhatsApp salvas!', description: 'Clique em "Verificar" para testar a conexão.' })
        setConnectionStatus('unknown')
        setConnectionDetail('')
      } catch (err) {
        toast({
          title: 'Erro ao salvar credenciais',
          description: err instanceof Error ? err.message : 'Tente novamente.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Integração Z-API</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure a integração com Z-API para enviar confirmações e lembretes via WhatsApp.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            {connectionStatus === 'connected' ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : connectionStatus === 'disconnected' ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Status da conexão</p>
              <p className="text-xs text-gray-500">
                {connectionStatus === 'connected'
                  ? connectionDetail || 'WhatsApp conectado e funcionando'
                  : connectionStatus === 'disconnected'
                  ? connectionDetail || 'Não conectado – verifique as credenciais'
                  : 'Salve as credenciais e clique em "Verificar"'}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={checkConnection}
            disabled={checkingStatus}
            className="gap-1.5"
          >
            {checkingStatus ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Verificar
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="zapiInstanceId" className="text-gray-700 font-medium">
            ID da instância Z-API
          </Label>
          <Input
            id="zapiInstanceId"
            placeholder="Ex: 3ABC12345"
            {...register('zapiInstanceId')}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsappToken" className="text-gray-700 font-medium">
            Token Z-API
          </Label>
          <Input
            id="whatsappToken"
            type="password"
            placeholder="Seu token de autenticação"
            {...register('whatsappToken')}
          />
          {errors.whatsappToken && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.whatsappToken.message}
            </p>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 space-y-1">
          <p className="font-semibold">Como obter suas credenciais:</p>
          <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
            <li>Acesse o painel em <span className="font-mono text-xs">app.z-api.io</span></li>
            <li>Crie ou selecione uma instância WhatsApp</li>
            <li>Copie o ID da instância e o token de segurança</li>
            <li>Cole os valores acima e salve</li>
          </ol>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar WhatsApp
        </Button>
      </div>
    </form>
  )
}

// ── Disponibilidade Tab ────────────────────────────────────────────────────────

function DisponibilidadeTab() {
  const [isPending, startTransition] = useTransition()
  const [rows, setRows] = useState<AvailabilityRow[]>(
    DAYS_OF_WEEK.map(({ day }) => ({
      dayOfWeek: day,
      active: day >= 1 && day <= 5, // Mon–Fri default
      startTime: '08:00',
      endTime: '18:00',
    })),
  )
  const { toast } = useToast()

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/availability')
      if (res.ok) {
        const data: AvailabilityRow[] = await res.json()
        if (data.length > 0) {
          setRows(
            DAYS_OF_WEEK.map(({ day }) => {
              const found = data.find((r) => r.dayOfWeek === day)
              return found ?? { dayOfWeek: day, active: false, startTime: '08:00', endTime: '18:00' }
            }),
          )
        }
      }
    }
    load()
  }, [])

  function updateRow(dayOfWeek: number, patch: Partial<AvailabilityRow>) {
    setRows((prev) =>
      prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r)),
    )
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const res = await fetch('/api/availability', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rows),
        })
        if (!res.ok) throw new Error()
        toast({ title: 'Disponibilidade salva!' })
      } catch {
        toast({ title: 'Erro ao salvar disponibilidade', variant: 'destructive' })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Horário de atendimento</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure os dias e horários em que você aceita agendamentos.
          </p>
        </div>

        <div className="space-y-3">
          {DAYS_OF_WEEK.map(({ day, label }) => {
            const row = rows.find((r) => r.dayOfWeek === day)!
            return (
              <div
                key={day}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-colors ${
                  row.active ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-gray-50/50'
                }`}
              >
                {/* Toggle + Label */}
                <div className="flex items-center gap-3 sm:w-44">
                  <button
                    type="button"
                    aria-label={`${row.active ? 'Desativar' : 'Ativar'} ${label}`}
                    onClick={() => updateRow(day, { active: !row.active })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
                      row.active ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        row.active ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${row.active ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    {label}
                  </span>
                </div>

                {/* Time inputs */}
                {row.active ? (
                  <div className="flex items-center gap-3 ml-0 sm:ml-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">De</span>
                      <input
                        type="time"
                        value={row.startTime}
                        onChange={(e) => updateRow(day, { startTime: e.target.value })}
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">até</span>
                      <input
                        type="time"
                        value={row.endTime}
                        onChange={(e) => updateRow(day, { endTime: e.target.value })}
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 ml-2">Fechado</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          disabled={isPending}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar disponibilidade
        </Button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { id: 'perfil', label: 'Perfil', icon: <Building2 className="h-4 w-4" /> },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" /> },
  { id: 'disponibilidade', label: 'Disponibilidade', icon: <Clock className="h-4 w-4" /> },
]

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('perfil')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie as configurações do seu negócio
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'perfil' && <PerfilTab />}
      {activeTab === 'whatsapp' && <WhatsAppTab />}
      {activeTab === 'disponibilidade' && <DisponibilidadeTab />}
    </div>
  )
}
