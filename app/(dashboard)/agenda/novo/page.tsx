'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Scissors,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import { format, addDays } from 'date-fns'

interface Customer {
  id: string
  name: string
  phone: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
  active: boolean
}

export default function NovoAgendamentoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const [customerId, setCustomerId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [time, setTime] = useState('09:00')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [cRes, sRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/services'),
        ])
        if (cRes.ok) setCustomers(await cRes.json())
        if (sRes.ok) {
          const allServices: Service[] = await sRes.json()
          setServices(allServices.filter((s) => s.active))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const selectedService = services.find((s) => s.id === serviceId)

  function validate() {
    const errs: Record<string, string> = {}
    if (!customerId) errs.customerId = 'Selecione um cliente'
    if (!serviceId) errs.serviceId = 'Selecione um serviço'
    if (!date) errs.date = 'Informe a data'
    if (!time) errs.time = 'Informe o horário'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const scheduledAt = new Date(`${date}T${time}:00`)

    startTransition(async () => {
      try {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId,
            serviceId,
            scheduledAt: scheduledAt.toISOString(),
            notes: notes || undefined,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          if (res.status === 409) {
            toast({
              title: 'Conflito de horário',
              description: 'Já existe um agendamento nesse horário.',
              variant: 'destructive',
            })
          } else {
            toast({
              title: 'Erro ao criar agendamento',
              description: err.error ?? 'Tente novamente.',
              variant: 'destructive',
            })
          }
          return
        }

        toast({ title: 'Agendamento criado com sucesso!' })
        router.push('/agenda')
      } catch {
        toast({ title: 'Erro inesperado. Tente novamente.', variant: 'destructive' })
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/agenda"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para a agenda
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Agendamento</h1>
        <p className="text-sm text-gray-500 mt-1">
          Preencha os dados para criar um novo agendamento
        </p>
      </div>

      {/* No customers warning */}
      {customers.length === 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <span>
            Você não tem clientes cadastrados.{' '}
            <Link href="/clientes" className="font-semibold underline hover:no-underline">
              Cadastre um cliente
            </Link>{' '}
            antes de criar um agendamento.
          </span>
        </div>
      )}

      {/* No services warning */}
      {services.length === 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
          <span>
            Você não tem serviços ativos.{' '}
            <Link href="/servicos" className="font-semibold underline hover:no-underline">
              Configure seus serviços
            </Link>{' '}
            antes de criar um agendamento.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Cliente */}
        <div className="space-y-1.5">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            Cliente <span className="text-red-500">*</span>
          </Label>
          <select
            value={customerId}
            onChange={(e) => { setCustomerId(e.target.value); setErrors((p) => ({ ...p, customerId: '' })) }}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.customerId ? 'border-red-400' : 'border-gray-200'
            }`}
          >
            <option value="">Selecionar cliente...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} – {c.phone}
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.customerId}
            </p>
          )}
          <p className="text-xs text-gray-400">
            Não encontrou o cliente?{' '}
            <Link href="/clientes" className="text-blue-600 hover:underline">
              Cadastre aqui
            </Link>
          </p>
        </div>

        {/* Serviço */}
        <div className="space-y-1.5">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <Scissors className="h-4 w-4 text-gray-400" />
            Serviço <span className="text-red-500">*</span>
          </Label>
          <select
            value={serviceId}
            onChange={(e) => { setServiceId(e.target.value); setErrors((p) => ({ ...p, serviceId: '' })) }}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              errors.serviceId ? 'border-red-400' : 'border-gray-200'
            }`}
          >
            <option value="">Selecionar serviço...</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} – {s.duration} min – {formatCurrency(s.price)}
              </option>
            ))}
          </select>
          {errors.serviceId && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {errors.serviceId}
            </p>
          )}
          {selectedService && (
            <div className="flex gap-4 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {selectedService.duration} minutos
              </span>
              <span className="font-medium text-green-700">
                {formatCurrency(selectedService.price)}
              </span>
            </div>
          )}
        </div>

        {/* Data e Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              Data <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={date}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: '' })) }}
              className={errors.date ? 'border-red-400' : ''}
            />
            {errors.date && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.date}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-gray-700 font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              Horário <span className="text-red-500">*</span>
            </Label>
            <Input
              type="time"
              value={time}
              onChange={(e) => { setTime(e.target.value); setErrors((p) => ({ ...p, time: '' })) }}
              className={errors.time ? 'border-red-400' : ''}
            />
            {errors.time && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.time}
              </p>
            )}
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-1.5">
          <Label className="text-gray-700 font-medium">
            Observações <span className="text-gray-400 font-normal">(opcional)</span>
          </Label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Informações adicionais sobre o agendamento..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" asChild className="flex-1">
            <Link href="/agenda">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            disabled={isPending || customers.length === 0 || services.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvando...</>
            ) : (
              'Criar agendamento'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
