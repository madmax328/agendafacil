'use client'

import { useState, useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  DollarSign,
  Loader2,
  AlertCircle,
  Scissors,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import {
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
} from './actions'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Service {
  id: string
  name: string
  duration: number
  price: number
  description: string | null
  active: boolean
}

// ── Zod schema (client-side) ───────────────────────────────────────────────────

const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  duration: z
    .number({ invalid_type_error: 'Informe a duração em minutos' })
    .min(15, 'Duração mínima é 15 minutos'),
  price: z
    .number({ invalid_type_error: 'Informe o preço' })
    .min(0, 'Preço deve ser positivo'),
  description: z.string().optional(),
})

type ServiceFormData = z.infer<typeof serviceSchema>

// ── Dialog component ───────────────────────────────────────────────────────────

interface ServiceDialogProps {
  open: boolean
  onClose: () => void
  editing: Service | null
  onSaved: (service: Service) => void
}

function ServiceDialog({ open, onClose, editing, onSaved }: ServiceDialogProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: editing
      ? {
          name: editing.name,
          duration: editing.duration,
          price: editing.price,
          description: editing.description ?? '',
        }
      : { name: '', duration: 60, price: 0, description: '' },
  })

  // Reset form whenever editing target changes
  useEffect(() => {
    reset(
      editing
        ? {
            name: editing.name,
            duration: editing.duration,
            price: editing.price,
            description: editing.description ?? '',
          }
        : { name: '', duration: 60, price: 0, description: '' },
    )
  }, [editing, reset])

  if (!open) return null

  function onSubmit(data: ServiceFormData) {
    startTransition(async () => {
      try {
        if (editing) {
          const updated = await updateService(editing.id, data)
          onSaved(updated as Service)
          toast({ title: 'Serviço atualizado com sucesso!' })
        } else {
          const created = await createService(data)
          onSaved(created as Service)
          toast({ title: 'Serviço criado com sucesso!' })
        }
        onClose()
      } catch {
        toast({
          title: 'Erro ao salvar serviço',
          description: 'Tente novamente em alguns instantes.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {editing ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {editing
              ? 'Atualize as informações do serviço'
              : 'Preencha os dados do novo serviço'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {/* Nome */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-gray-700 font-medium">
              Nome do serviço <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Corte de cabelo masculino"
              {...register('name')}
              className={errors.name ? 'border-red-400' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Duração + Preço */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="duration" className="text-gray-700 font-medium">
                Duração (min) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                type="number"
                min={15}
                step={5}
                placeholder="60"
                {...register('duration', { valueAsNumber: true })}
                className={errors.duration ? 'border-red-400' : ''}
              />
              {errors.duration && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.duration.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-gray-700 font-medium">
                Preço (R$) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                placeholder="0,00"
                {...register('price', { valueAsNumber: true })}
                className={errors.price ? 'border-red-400' : ''}
              />
              {errors.price && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-gray-700 font-medium">
              Descrição <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Descreva brevemente o serviço..."
              {...register('description')}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : editing ? (
                'Salvar alterações'
              ) : (
                'Criar serviço'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete confirmation dialog ────────────────────────────────────────────────

interface DeleteDialogProps {
  service: Service | null
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}

function DeleteDialog({ service, onCancel, onConfirm, loading }: DeleteDialogProps) {
  if (!service) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Excluir serviço</h3>
            <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
          </div>
        </div>

        <p className="text-sm text-gray-700">
          Tem certeza que deseja excluir o serviço{' '}
          <span className="font-semibold">"{service.name}"</span>?
        </p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deletingService, setDeletingService] = useState<Service | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const { toast } = useToast()

  // Load services on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/services')
        if (res.ok) {
          const data = await res.json()
          setServices(data)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function openCreate() {
    setEditingService(null)
    setDialogOpen(true)
  }

  function openEdit(service: Service) {
    setEditingService(service)
    setDialogOpen(true)
  }

  function handleSaved(service: Service) {
    setServices((prev) => {
      const idx = prev.findIndex((s) => s.id === service.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = service
        return next
      }
      return [service, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingService) return
    setDeleteLoading(true)
    try {
      await deleteService(deletingService.id)
      setServices((prev) => prev.filter((s) => s.id !== deletingService.id))
      toast({ title: 'Serviço excluído.' })
    } catch {
      toast({
        title: 'Erro ao excluir serviço',
        variant: 'destructive',
      })
    } finally {
      setDeleteLoading(false)
      setDeletingService(null)
    }
  }

  async function handleToggle(service: Service) {
    setTogglingId(service.id)
    try {
      await toggleServiceStatus(service.id, !service.active)
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, active: !s.active } : s)),
      )
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os serviços oferecidos no seu negócio
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : services.length === 0 ? (
        /* Empty state */
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Scissors className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum serviço cadastrado
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
            Adicione os serviços que você oferece para que seus clientes possam
            agendá-los online.
          </p>
          <Button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Adicionar primeiro serviço
          </Button>
        </div>
      ) : (
        /* Services list */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-start sm:items-center gap-4 px-6 py-4"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mt-0.5 sm:mt-0">
                  <Scissors className="h-5 w-5 text-blue-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate">
                      {service.name}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        service.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {service.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {service.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      {service.duration} min
                    </span>
                    <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle */}
                  <button
                    type="button"
                    aria-label={service.active ? 'Desativar serviço' : 'Ativar serviço'}
                    onClick={() => handleToggle(service)}
                    disabled={togglingId === service.id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                      service.active ? 'bg-blue-600' : 'bg-gray-200'
                    } ${togglingId === service.id ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        service.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    aria-label="Editar serviço"
                    onClick={() => openEdit(service)}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    aria-label="Excluir serviço"
                    onClick={() => setDeletingService(service)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer count */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {services.length} {services.length === 1 ? 'serviço cadastrado' : 'serviços cadastrados'} &mdash;{' '}
              {services.filter((s) => s.active).length} ativo
              {services.filter((s) => s.active).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Create / Edit dialog */}
      <ServiceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editingService}
        onSaved={handleSaved}
      />

      {/* Delete dialog */}
      <DeleteDialog
        service={deletingService}
        onCancel={() => setDeletingService(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
