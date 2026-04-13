'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'

// ─── Schemas ────────────────────────────────────────────────────────────────

const businessSchema = z.object({
  businessName: z.string().min(1, 'Nome do negócio é obrigatório'),
  businessType: z.string().min(1, 'Tipo de negócio é obrigatório'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
})

const serviceItemSchema = z.object({
  name: z.string().min(1, 'Nome do serviço é obrigatório'),
  duration: z
    .number({ invalid_type_error: 'Duração inválida' })
    .min(15, 'Mínimo 15 minutos'),
  price: z
    .number({ invalid_type_error: 'Preço inválido' })
    .min(0, 'Preço não pode ser negativo'),
})

type BusinessData = z.infer<typeof businessSchema>
type ServiceItem = z.infer<typeof serviceItemSchema>

// ─── Constants ──────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  { value: 'salao', label: 'Salão de Beleza' },
  { value: 'clinica', label: 'Clínica' },
  { value: 'dentista', label: 'Dentista' },
  { value: 'psicologo', label: 'Psicólogo' },
  { value: 'outro', label: 'Outro' },
]

const DAYS_OF_WEEK = [
  { dayOfWeek: 0, label: 'Domingo' },
  { dayOfWeek: 1, label: 'Segunda-feira' },
  { dayOfWeek: 2, label: 'Terça-feira' },
  { dayOfWeek: 3, label: 'Quarta-feira' },
  { dayOfWeek: 4, label: 'Quinta-feira' },
  { dayOfWeek: 5, label: 'Sexta-feira' },
  { dayOfWeek: 6, label: 'Sábado' },
]

const DEFAULT_AVAILABILITY = DAYS_OF_WEEK.map((d) => ({
  dayOfWeek: d.dayOfWeek,
  startTime: '08:00',
  endTime: '18:00',
  active: d.dayOfWeek >= 1 && d.dayOfWeek <= 5, // Mon–Fri default active
}))

const STEPS = [
  { number: 1, label: 'Seu negócio' },
  { number: 2, label: 'Seus serviços' },
  { number: 3, label: 'Disponibilidade' },
]

// ─── Progress Indicator ──────────────────────────────────────────────────────

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                currentStep > step.number
                  ? 'bg-blue-600 text-white'
                  : currentStep === step.number
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {currentStep > step.number ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                'mt-1 text-xs font-medium',
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={cn(
                'h-0.5 w-16 mx-2 mb-5 transition-colors',
                currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1: Business Info ───────────────────────────────────────────────────

function StepBusiness({
  onNext,
}: {
  onNext: (data: BusinessData) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessData>({
    resolver: zodResolver(businessSchema),
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="space-y-1">
        <Label htmlFor="businessName">Nome do negócio *</Label>
        <Input
          id="businessName"
          placeholder="Ex: Studio Beleza Maria"
          {...register('businessName')}
        />
        {errors.businessName && (
          <p className="text-sm text-red-500">{errors.businessName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="businessType">Tipo de negócio *</Label>
        <select
          id="businessType"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          {...register('businessType')}
        >
          <option value="">Selecione o tipo...</option>
          {BUSINESS_TYPES.map((bt) => (
            <option key={bt.value} value={bt.value}>
              {bt.label}
            </option>
          ))}
        </select>
        {errors.businessType && (
          <p className="text-sm text-red-500">{errors.businessType.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Telefone / WhatsApp</Label>
        <Input
          id="phone"
          placeholder="(11) 99999-9999"
          {...register('phone')}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          placeholder="Rua, número, complemento"
          {...register('address')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" placeholder="São Paulo" {...register('city')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="state">Estado</Label>
          <Input id="state" placeholder="SP" maxLength={2} {...register('state')} />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit">Próximo</Button>
      </div>
    </form>
  )
}

// ─── Step 2: Services ────────────────────────────────────────────────────────

function StepServices({
  onNext,
  onBack,
}: {
  onNext: (services: ServiceItem[]) => void
  onBack: () => void
}) {
  const [services, setServices] = useState<ServiceItem[]>([
    { name: '', duration: 60, price: 0 },
  ])
  const [errors, setErrors] = useState<
    Partial<Record<keyof ServiceItem, string>>[]
  >([{}])

  function updateService(
    index: number,
    field: keyof ServiceItem,
    value: string | number
  ) {
    setServices((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function addService() {
    setServices((prev) => [...prev, { name: '', duration: 60, price: 0 }])
    setErrors((prev) => [...prev, {}])
  }

  function removeService(index: number) {
    if (services.length === 1) return
    setServices((prev) => prev.filter((_, i) => i !== index))
    setErrors((prev) => prev.filter((_, i) => i !== index))
  }

  function validate(): boolean {
    const newErrors = services.map((s) => {
      const result = serviceItemSchema.safeParse(s)
      if (result.success) return {}
      const fieldErrors: Partial<Record<keyof ServiceItem, string>> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ServiceItem
        fieldErrors[key] = issue.message
      }
      return fieldErrors
    })
    setErrors(newErrors)
    return newErrors.every((e) => Object.keys(e).length === 0)
  }

  function handleNext() {
    if (validate()) {
      onNext(services)
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Adicione os serviços que você oferece. Você poderá editar e adicionar
        mais serviços depois.
      </p>

      <div className="space-y-4">
        {services.map((service, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Serviço {idx + 1}
              </span>
              {services.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeService(idx)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  aria-label="Remover serviço"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-1">
              <Label>Nome do serviço *</Label>
              <Input
                value={service.name}
                onChange={(e) => updateService(idx, 'name', e.target.value)}
                placeholder="Ex: Corte feminino"
              />
              {errors[idx]?.name && (
                <p className="text-sm text-red-500">{errors[idx].name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Duração (min) *</Label>
                <Input
                  type="number"
                  min={15}
                  step={15}
                  value={service.duration}
                  onChange={(e) =>
                    updateService(idx, 'duration', parseInt(e.target.value) || 0)
                  }
                  placeholder="60"
                />
                {errors[idx]?.duration && (
                  <p className="text-sm text-red-500">{errors[idx].duration}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Preço (R$) *</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={service.price}
                  onChange={(e) =>
                    updateService(idx, 'price', parseFloat(e.target.value) || 0)
                  }
                  placeholder="50,00"
                />
                {errors[idx]?.price && (
                  <p className="text-sm text-red-500">{errors[idx].price}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addService}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Adicionar outro serviço
      </button>

      <div className="flex justify-between pt-2">
        <Button variant="outline" type="button" onClick={onBack}>
          Voltar
        </Button>
        <Button type="button" onClick={handleNext}>
          Próximo
        </Button>
      </div>
    </div>
  )
}

// ─── Step 3: Availability ────────────────────────────────────────────────────

type AvailabilityEntry = {
  dayOfWeek: number
  startTime: string
  endTime: string
  active: boolean
}

function StepAvailability({
  onSubmit,
  onBack,
  isSubmitting,
}: {
  onSubmit: (availability: AvailabilityEntry[]) => void
  onBack: () => void
  isSubmitting: boolean
}) {
  const [availability, setAvailability] =
    useState<AvailabilityEntry[]>(DEFAULT_AVAILABILITY)

  function toggleDay(dayOfWeek: number) {
    setAvailability((prev) =>
      prev.map((a) =>
        a.dayOfWeek === dayOfWeek ? { ...a, active: !a.active } : a
      )
    )
  }

  function updateTime(
    dayOfWeek: number,
    field: 'startTime' | 'endTime',
    value: string
  ) {
    setAvailability((prev) =>
      prev.map((a) =>
        a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a
      )
    )
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        Configure os dias e horários em que você atende. Você poderá alterar
        isso nas configurações depois.
      </p>

      <div className="space-y-3">
        {DAYS_OF_WEEK.map((day) => {
          const entry = availability.find((a) => a.dayOfWeek === day.dayOfWeek)!
          return (
            <div
              key={day.dayOfWeek}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                entry.active
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              )}
            >
              <button
                type="button"
                onClick={() => toggleDay(day.dayOfWeek)}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  entry.active ? 'text-blue-600' : 'text-gray-400'
                )}
                aria-label={`${entry.active ? 'Desativar' : 'Ativar'} ${day.label}`}
              >
                {entry.active ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              <span
                className={cn(
                  'w-32 text-sm font-medium',
                  entry.active ? 'text-gray-800' : 'text-gray-400'
                )}
              >
                {day.label}
              </span>

              {entry.active ? (
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="time"
                    value={entry.startTime}
                    onChange={(e) =>
                      updateTime(day.dayOfWeek, 'startTime', e.target.value)
                    }
                    className="h-8 rounded border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-500 text-sm">até</span>
                  <input
                    type="time"
                    value={entry.endTime}
                    onChange={(e) =>
                      updateTime(day.dayOfWeek, 'endTime', e.target.value)
                    }
                    className="h-8 rounded border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <span className="ml-auto text-sm text-gray-400">Fechado</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" type="button" onClick={onBack} disabled={isSubmitting}>
          Voltar
        </Button>
        <Button
          type="button"
          onClick={() => onSubmit(availability)}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando...' : 'Concluir'}
        </Button>
      </div>
    </div>
  )
}

// ─── Main Onboarding Page ────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Accumulated data across steps
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [servicesData, setServicesData] = useState<ServiceItem[]>([])

  function handleBusinessNext(data: BusinessData) {
    setBusinessData(data)
    setStep(2)
  }

  function handleServicesNext(services: ServiceItem[]) {
    setServicesData(services)
    setStep(3)
  }

  async function handleAvailabilitySubmit(availability: AvailabilityEntry[]) {
    if (!businessData) return
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...businessData,
          services: servicesData,
          availability,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Erro ao salvar dados')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Markou</h1>
          <p className="mt-2 text-gray-600">
            Vamos configurar sua conta em poucos passos
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <ProgressIndicator currentStep={step} />

          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {STEPS[step - 1].label}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {step === 1 && <StepBusiness onNext={handleBusinessNext} />}
          {step === 2 && (
            <StepServices
              onNext={handleServicesNext}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepAvailability
              onSubmit={handleAvailabilitySubmit}
              onBack={() => setStep(2)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  )
}
