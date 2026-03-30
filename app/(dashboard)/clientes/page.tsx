'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Users,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  notes: string | null
  createdAt: string
  _count?: { appointments: number }
  lastAppointment?: string | null
}

// ── Zod schema ─────────────────────────────────────────────────────────────────

const customerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .regex(/^\d[\d\s\-().]+$/, 'Formato inválido'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

// ── Customer Dialog ────────────────────────────────────────────────────────────

interface CustomerDialogProps {
  open: boolean
  onClose: () => void
  editing: Customer | null
  onSaved: (customer: Customer) => void
}

function CustomerDialog({ open, onClose, editing, onSaved }: CustomerDialogProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: editing
      ? { name: editing.name, phone: editing.phone, email: editing.email ?? '', notes: editing.notes ?? '' }
      : { name: '', phone: '', email: '', notes: '' },
  })

  useEffect(() => {
    reset(
      editing
        ? { name: editing.name, phone: editing.phone, email: editing.email ?? '', notes: editing.notes ?? '' }
        : { name: '', phone: '', email: '', notes: '' },
    )
  }, [editing, reset])

  if (!open) return null

  function onSubmit(data: CustomerFormData) {
    startTransition(async () => {
      try {
        const method = editing ? 'PUT' : 'POST'
        const url = editing ? `/api/customers/${editing.id}` : '/api/customers'
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Erro ao salvar')
        }
        const saved: Customer = await res.json()
        onSaved(saved)
        toast({ title: editing ? 'Cliente atualizado!' : 'Cliente cadastrado!' })
        onClose()
      } catch (err: unknown) {
        toast({
          title: 'Erro ao salvar cliente',
          description: err instanceof Error ? err.message : 'Tente novamente.',
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editing ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {editing ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente'}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cname" className="text-gray-700 font-medium">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cname"
              placeholder="Nome completo do cliente"
              {...register('name')}
              className={errors.name ? 'border-red-400' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cphone" className="text-gray-700 font-medium">
                Telefone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cphone"
                placeholder="(11) 99999-9999"
                {...register('phone')}
                className={errors.phone ? 'border-red-400' : ''}
              />
              {errors.phone && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cemail" className="text-gray-700 font-medium">
                E-mail <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <Input
                id="cemail"
                type="email"
                placeholder="cliente@email.com"
                {...register('email')}
                className={errors.email ? 'border-red-400' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cnotes" className="text-gray-700 font-medium">
              Observações <span className="text-gray-400 font-normal">(opcional)</span>
            </Label>
            <textarea
              id="cnotes"
              rows={3}
              placeholder="Preferências, alergias, informações relevantes..."
              {...register('notes')}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Salvando...
                </>
              ) : editing ? 'Salvar alterações' : 'Cadastrar cliente'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete Confirm Dialog ──────────────────────────────────────────────────────

interface DeleteDialogProps {
  customer: Customer | null
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}

function DeleteDialog({ customer, onCancel, onConfirm, loading }: DeleteDialogProps) {
  if (!customer) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Excluir cliente</h3>
            <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
        <p className="text-sm text-gray-700">
          Tem certeza que deseja excluir <span className="font-semibold">"{customer.name}"</span>?
          Todos os agendamentos associados também serão removidos.
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
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()

  const fetchCustomers = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : ''
      const res = await fetch(`/api/customers${params}`)
      if (res.ok) setCustomers(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(search), 400)
    return () => clearTimeout(timer)
  }, [search, fetchCustomers])

  function handleSaved(customer: Customer) {
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c.id === customer.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = customer
        return next
      }
      return [customer, ...prev]
    })
  }

  async function handleDelete() {
    if (!deletingCustomer) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/customers/${deletingCustomer.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setCustomers((prev) => prev.filter((c) => c.id !== deletingCustomer.id))
      toast({ title: 'Cliente excluído.' })
    } catch {
      toast({ title: 'Erro ao excluir cliente', variant: 'destructive' })
    } finally {
      setDeleteLoading(false)
      setDeletingCustomer(null)
    }
  }

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie sua base de clientes
          </p>
        </div>
        <Button
          onClick={() => { setEditingCustomer(null); setDialogOpen(true) }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
            {search
              ? 'Tente buscar com outros termos.'
              : 'Cadastre seus clientes para gerenciar agendamentos com mais facilidade.'}
          </p>
          {!search && (
            <Button
              onClick={() => { setEditingCustomer(null); setDialogOpen(true) }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Cadastrar primeiro cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span className="col-span-3">Nome</span>
            <span className="col-span-3">Contato</span>
            <span className="col-span-2 text-center">Agendamentos</span>
            <span className="col-span-3">Último agendamento</span>
            <span className="col-span-1" />
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.map((customer) => (
              <div
                key={customer.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
              >
                {/* Name */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 truncate">{customer.name}</span>
                  </div>
                </div>

                {/* Contact */}
                <div className="md:col-span-3 space-y-0.5 ml-12 md:ml-0">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    {customer.phone}
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                </div>

                {/* Appointment count */}
                <div className="md:col-span-2 md:text-center ml-12 md:ml-0">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {customer._count?.appointments ?? 0}{' '}
                    <span className="text-gray-400 hidden md:inline">
                      {(customer._count?.appointments ?? 0) === 1 ? 'visita' : 'visitas'}
                    </span>
                  </span>
                </div>

                {/* Last appointment */}
                <div className="md:col-span-3 ml-12 md:ml-0">
                  <span className="text-sm text-gray-500">
                    {customer.lastAppointment
                      ? formatDate(customer.lastAppointment, "dd/MM/yyyy 'às' HH:mm")
                      : '—'}
                  </span>
                </div>

                {/* Actions */}
                <div className="md:col-span-1 flex items-center gap-1 ml-12 md:ml-0 justify-start md:justify-end">
                  <button
                    type="button"
                    aria-label="Editar cliente"
                    onClick={() => { setEditingCustomer(customer); setDialogOpen(true) }}
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Excluir cliente"
                    onClick={() => setDeletingCustomer(customer)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {filtered.length} {filtered.length === 1 ? 'cliente' : 'clientes'}
              {search && ` encontrado${filtered.length !== 1 ? 's' : ''} para "${search}"`}
            </p>
          </div>
        </div>
      )}

      <CustomerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editingCustomer}
        onSaved={handleSaved}
      />
      <DeleteDialog
        customer={deletingCustomer}
        onCancel={() => setDeletingCustomer(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
