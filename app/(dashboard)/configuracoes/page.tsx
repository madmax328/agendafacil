'use client'

import { type ReactNode, useState, useEffect, useTransition, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2, Clock, Save, Loader2, CheckCircle2, XCircle,
  AlertCircle, RefreshCw, Crown, Zap, Sparkles, Users, Star,
  Plus, Trash2, Pencil, X, ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ── Types ──────────────────────────────────────────────────────────────────────

type TabId = 'perfil' | 'disponibilidade' | 'equipe' | 'avaliacoes'

interface Tab { id: TabId; label: string; icon: ReactNode }

const BUSINESS_TYPES = [
  { value: 'salao',          label: 'Salão de Beleza' },
  { value: 'barbearia',      label: 'Barbearia' },
  { value: 'clinica',        label: 'Clínica Estética' },
  { value: 'dentista',       label: 'Dentista' },
  { value: 'psicologo',      label: 'Psicólogo(a)' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta' },
  { value: 'nutricionista',  label: 'Nutricionista' },
  { value: 'personal',       label: 'Personal Trainer' },
  { value: 'manicure',       label: 'Manicure/Pedicure' },
  { value: 'outros',         label: 'Outros' },
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
  businessName:  z.string().min(1, 'Nome do negócio é obrigatório'),
  businessType:  z.string().min(1, 'Selecione o tipo'),
  phone:         z.string().optional(),
  address:       z.string().optional(),
  addressNumber: z.string().optional(),
  zipCode:       z.string().optional(),
  city:          z.string().optional(),
  state:         z.string().optional(),
  pixKey:        z.string().optional(),
  bio:           z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface AvailabilityRow {
  dayOfWeek: number
  active: boolean
  startTime: string
  endTime: string
}

interface TeamMember {
  id: string
  name: string
  role: string
  image: string | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  clientName: string
  createdAt: string
}

// ── ImageUpload component ──────────────────────────────────────────────────────

function ImageUpload({
  value,
  onChange,
  shape = 'square',
}: {
  value: string | null
  onChange: (val: string | null) => void
  shape?: 'square' | 'circle'
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Imagem muito grande. Máximo 2MB.', variant: 'destructive' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-center gap-5">
      <div className={`w-20 h-20 ${rounded} bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0`}>
        {value
          ? <img src={value} alt="" className="w-full h-full object-cover" />
          : <ImageIcon className="h-8 w-8 text-gray-300" />}
      </div>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          {value ? 'Trocar foto' : 'Escolher foto'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left">
            Remover
          </button>
        )}
        <p className="text-xs text-gray-400">JPG, PNG ou WebP · máx. 2MB</p>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        className="hidden" onChange={handleFile} />
    </div>
  )
}

// ── Perfil Tab ─────────────────────────────────────────────────────────────────

function PerfilTab() {
  const [isPending, startTransition] = useTransition()
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const { toast } = useToast()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    fetch('/api/profile').then(r => r.ok ? r.json() : null).then(d => {
      if (!d) return
      reset(d)
      setProfileImage(d.image ?? null)
    })
  }, [reset])

  function onSubmit(data: ProfileFormData) {
    startTransition(async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, image: profileImage }),
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
      {/* Logo */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Logo do negócio</h3>
          <p className="text-sm text-gray-500 mt-1">Aparece na sua página pública de agendamentos.</p>
        </div>
        <ImageUpload value={profileImage} onChange={setProfileImage} shape="square" />
      </div>

      {/* Informações do Negócio */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="text-base font-semibold text-gray-900">Informações do Negócio</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="businessName" className="text-gray-700 font-medium">
              Nome do negócio <span className="text-red-500">*</span>
            </Label>
            <Input id="businessName" placeholder="Ex: Studio Beleza Silva"
              {...register('businessName')}
              className={errors.businessName ? 'border-red-400' : ''} />
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
            <select id="businessType" {...register('businessType')}
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
              <option value="">Selecione...</option>
              {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-gray-700 font-medium">Telefone</Label>
            <Input id="phone" placeholder="(11) 99999-9999" {...register('phone')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pixKey" className="text-gray-700 font-medium">Chave Pix</Label>
            <Input id="pixKey" placeholder="CPF, CNPJ, e-mail ou telefone" {...register('pixKey')} />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Endereço</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="address" className="text-gray-700 font-medium">Rua / Logradouro</Label>
            <Input id="address" placeholder="Ex: Av. Paulista" {...register('address')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressNumber" className="text-gray-700 font-medium">Número</Label>
            <Input id="addressNumber" placeholder="Ex: 1000" {...register('addressNumber')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="zipCode" className="text-gray-700 font-medium">CEP</Label>
            <Input id="zipCode" placeholder="00000-000" {...register('zipCode')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-gray-700 font-medium">Cidade</Label>
            <Input id="city" placeholder="São Paulo" {...register('city')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-gray-700 font-medium">Estado</Label>
            <select id="state" {...register('state')}
              className="w-full h-10 rounded-md border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
              <option value="">UF</option>
              {STATES_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Sobre o negócio */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Sobre o negócio</h3>
          <p className="text-sm text-gray-500 mt-1">
            Apresente sua empresa aos clientes — aparece na sua página pública.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio" className="text-gray-700 font-medium">Descrição</Label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={5}
            placeholder="Conte um pouco sobre seu negócio, seus diferenciais, formas de pagamento..."
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white gap-2" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar perfil
        </Button>
      </div>
    </form>
  )
}

// ── Disponibilidade Tab ────────────────────────────────────────────────────────

function DisponibilidadeTab() {
  const [isPending, startTransition] = useTransition()
  const [rows, setRows] = useState<AvailabilityRow[]>(
    DAYS_OF_WEEK.map(({ day }) => ({ dayOfWeek: day, active: day >= 1 && day <= 5, startTime: '08:00', endTime: '18:00' })),
  )
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/availability').then(r => r.ok ? r.json() : []).then((data: AvailabilityRow[]) => {
      if (data.length > 0) {
        setRows(DAYS_OF_WEEK.map(({ day }) => {
          const found = data.find(r => r.dayOfWeek === day)
          return found ?? { dayOfWeek: day, active: false, startTime: '08:00', endTime: '18:00' }
        }))
      }
    })
  }, [])

  function updateRow(dayOfWeek: number, patch: Partial<AvailabilityRow>) {
    setRows(prev => prev.map(r => r.dayOfWeek === dayOfWeek ? { ...r, ...patch } : r))
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
          <p className="text-sm text-gray-500 mt-1">Configure os dias e horários em que você aceita agendamentos.</p>
        </div>
        <div className="space-y-3">
          {DAYS_OF_WEEK.map(({ day, label }) => {
            const row = rows.find(r => r.dayOfWeek === day)!
            return (
              <div key={day} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-colors ${
                row.active ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-gray-50/50'
              }`}>
                <div className="flex items-center gap-3 sm:w-44">
                  <button type="button" aria-label={`${row.active ? 'Desativar' : 'Ativar'} ${label}`}
                    onClick={() => updateRow(day, { active: !row.active })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${row.active ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${row.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </button>
                  <span className={`text-sm font-medium ${row.active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                </div>
                {row.active ? (
                  <div className="flex items-center gap-3 ml-0 sm:ml-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">De</span>
                      <input type="time" value={row.startTime} onChange={e => updateRow(day, { startTime: e.target.value })}
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">até</span>
                      <input type="time" value={row.endTime} onChange={e => updateRow(day, { endTime: e.target.value })}
                        className="h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
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
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white gap-2" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar disponibilidade
        </Button>
      </div>
    </div>
  )
}

// ── Equipe Tab ─────────────────────────────────────────────────────────────────

function EquipeTab() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', image: '' })
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/team').then(r => r.ok ? r.json() : [])
      .then(setMembers).finally(() => setLoading(false))
  }, [])

  function openAdd() { setForm({ name: '', role: '', image: '' }); setEditingId(null); setShowForm(true) }
  function openEdit(m: TeamMember) { setForm({ name: m.name, role: m.role, image: m.image ?? '' }); setEditingId(m.id); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditingId(null) }

  async function handleSave() {
    if (!form.name.trim() || !form.role.trim()) {
      toast({ title: 'Nome e função são obrigatórios', variant: 'destructive' }); return
    }
    setSaving(true)
    try {
      if (editingId) {
        await fetch(`/api/team/${editingId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        })
        setMembers(prev => prev.map(m => m.id === editingId ? { ...m, ...form, image: form.image || null } : m))
        toast({ title: 'Membro atualizado!' })
      } else {
        const res = await fetch('/api/team', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        })
        const created = await res.json()
        setMembers(prev => [...prev, created])
        toast({ title: 'Membro adicionado!' })
      }
      closeForm()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este membro da equipe?')) return
    await fetch(`/api/team/${id}`, { method: 'DELETE' })
    setMembers(prev => prev.filter(m => m.id !== id))
    toast({ title: 'Membro removido' })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Nossa equipe</h3>
            <p className="text-sm text-gray-500 mt-1">Apresente os profissionais da sua equipe na página pública.</p>
          </div>
          <Button type="button" onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" size="sm">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-900">{editingId ? 'Editar membro' : 'Novo membro'}</p>
              <button type="button" onClick={closeForm} className="p-1 rounded-lg hover:bg-gray-200 text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Nome *</Label>
                <Input placeholder="Ex: Ana Silva" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Função *</Label>
                <Input placeholder="Ex: Manicure, Cabeleireira" value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))} />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Foto (opcional)</Label>
                <ImageUpload
                  value={form.image || null}
                  onChange={val => setForm(p => ({ ...p, image: val ?? '' }))}
                  shape="circle"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" onClick={handleSave} disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" size="sm">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Salvar
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancelar</Button>
            </div>
          </div>
        )}

        {/* Members list */}
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>
        ) : members.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">Nenhum membro adicionado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {m.image
                    ? <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
                    : <span className="text-sm font-bold text-blue-600">{m.name.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => openEdit(m)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => handleDelete(m.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Avaliações Tab ─────────────────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}>
          <Star className={`h-5 w-5 ${n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  )
}

function AvaliacoesTab() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ clientName: '', rating: 5, comment: '' })
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/reviews').then(r => r.ok ? r.json() : [])
      .then(setReviews).finally(() => setLoading(false))
  }, [])

  function openAdd() { setForm({ clientName: '', rating: 5, comment: '' }); setShowForm(true) }
  function closeForm() { setShowForm(false) }

  async function handleSave() {
    if (!form.clientName.trim()) {
      toast({ title: 'Nome do cliente é obrigatório', variant: 'destructive' }); return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: form.clientName, rating: form.rating, comment: form.comment }),
      })
      const created = await res.json()
      setReviews(prev => [created, ...prev])
      toast({ title: 'Avaliação adicionada!' })
      closeForm()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta avaliação?')) return
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    setReviews(prev => prev.filter(r => r.id !== id))
    toast({ title: 'Avaliação removida' })
  }

  const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Avaliações dos clientes</h3>
            <p className="text-sm text-gray-500 mt-1">Adicione avaliações recebidas pelos seus clientes.</p>
          </div>
          <Button type="button" onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" size="sm">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        {/* Summary */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
            <span className="text-2xl font-extrabold text-gray-900">{avg.toFixed(1)}</span>
            <StarRating value={Math.round(avg)} />
            <span className="text-sm text-gray-500">{reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}</span>
          </div>
        )}

        {/* Inline form */}
        {showForm && (
          <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-gray-900">Nova avaliação</p>
              <button type="button" onClick={closeForm} className="p-1 rounded-lg hover:bg-gray-200 text-gray-500">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Nome do cliente *</Label>
                <Input placeholder="Ex: Maria Silva" value={form.clientName}
                  onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Nota</Label>
                <StarRating value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-semibold text-gray-700">Comentário (opcional)</Label>
                <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  rows={3} placeholder="O que o cliente disse..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" onClick={handleSave} disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" size="sm">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Salvar
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancelar</Button>
            </div>
          </div>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl">
            <Star className="h-10 w-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-500">Nenhuma avaliação adicionada ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="p-4 rounded-xl border border-gray-100 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} />
                    <span className="text-sm font-semibold text-gray-900">{r.clientName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">
                      {format(new Date(r.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <button type="button" onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ml-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── WhatsApp Tab ───────────────────────────────────────────────────────────────

const PLAN_WHATSAPP_FEATURES: Record<string, { label: string; available: boolean }[]> = {
  FREE:    [
    { label: 'Confirmação via WhatsApp', available: false },
    { label: 'Lembrete J-1 (dia anterior)', available: false },
    { label: 'Lembrete H-2 (2 horas antes)', available: false },
  ],
  STARTER: [
    { label: 'Confirmação via WhatsApp', available: true },
    { label: 'Lembrete J-1 (dia anterior)', available: false },
    { label: 'Lembrete H-2 (2 horas antes)', available: false },
  ],
  PRO: [
    { label: 'Confirmação via WhatsApp', available: true },
    { label: 'Lembrete J-1 (dia anterior)', available: true },
    { label: 'Lembrete H-2 (2 horas antes)', available: true },
  ],
}

const PLAN_ICON: Record<string, ReactNode> = {
  FREE:    <Sparkles className="h-5 w-5 text-gray-500" />,
  STARTER: <Zap className="h-5 w-5 text-blue-500" />,
  PRO:     <Crown className="h-5 w-5 text-purple-500" />,
}

// ── Main Page ──────────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { id: 'perfil',         label: 'Perfil',         icon: <Building2 className="h-4 w-4" /> },
  { id: 'disponibilidade',label: 'Disponibilidade', icon: <Clock className="h-4 w-4" /> },
  { id: 'equipe',         label: 'Equipe',          icon: <Users className="h-4 w-4" /> },
  { id: 'avaliacoes',     label: 'Avaliações',      icon: <Star className="h-4 w-4" /> },
]

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('perfil')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie as configurações do seu negócio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-fit ${
              activeTab === tab.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'perfil'          && <PerfilTab />}
      {activeTab === 'disponibilidade' && <DisponibilidadeTab />}
      {activeTab === 'equipe'          && <EquipeTab />}
      {activeTab === 'avaliacoes'      && <AvaliacoesTab />}
    </div>
  )
}
