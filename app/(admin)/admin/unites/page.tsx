'use client'

import { useEffect, useState } from 'react'
import { Plus, KeyRound, Pencil, Trash2, Lock, Unlock } from 'lucide-react'

type Unit = { id: string; type: string; name: string; allowOrderModification: boolean }

const PALETTES = [
  'bg-orange-500', 'bg-amber-500', 'bg-red-500',
  'bg-emerald-500', 'bg-blue-500', 'bg-purple-500',
]
const LIGHT = [
  'bg-orange-50 border-orange-200 text-orange-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-red-50 border-red-200 text-red-700',
  'bg-emerald-50 border-emerald-200 text-emerald-700',
  'bg-blue-50 border-blue-200 text-blue-700',
  'bg-purple-50 border-purple-200 text-purple-700',
]

type ModalMode = 'password' | 'edit' | 'add'

export default function UnitesPage() {
  const [units, setUnits] = useState<Unit[]>([])
  const [modal, setModal] = useState<{ mode: ModalMode; unit?: Unit } | null>(null)
  const [form, setForm] = useState({ name: '', type: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const data = await fetch('/api/admin/units').then(r => r.json())
    setUnits(Array.isArray(data) ? data : [])
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setForm({ name: '', type: '', password: '', confirm: '' })
    setError('')
    setModal({ mode: 'add' })
  }

  function openEdit(unit: Unit) {
    setForm({ name: unit.name, type: unit.type.toLowerCase(), password: '', confirm: '' })
    setError('')
    setModal({ mode: 'edit', unit })
  }

  function openPassword(unit: Unit) {
    setForm({ name: '', type: '', password: '', confirm: '' })
    setError('')
    setModal({ mode: 'password', unit })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (modal?.mode === 'add') {
        if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return }
        const res = await fetch('/api/admin/units', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, type: form.type, password: form.password }),
        })
        if (!res.ok) { const d = await res.json(); setError(d.error); return }
      } else if (modal?.mode === 'edit' && modal.unit) {
        const res = await fetch(`/api/admin/units/${modal.unit.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name }),
        })
        if (!res.ok) { const d = await res.json(); setError(d.error); return }
      } else if (modal?.mode === 'password' && modal.unit) {
        if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return }
        const res = await fetch(`/api/admin/units/${modal.unit.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: form.password }),
        })
        if (!res.ok) { const d = await res.json(); setError(d.error); return }
      }
      setModal(null); load()
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  async function toggleModification(unit: Unit) {
    await fetch(`/api/admin/units/${unit.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowOrderModification: !unit.allowOrderModification }),
    })
    load()
  }

  async function handleDelete(unit: Unit) {
    if (!confirm(`Supprimer l'unité "${unit.name}" ? Cette action est irréversible.`)) return
    await fetch(`/api/admin/units/${unit.id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unités de production</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez les unités, mots de passe et permissions</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Nouvelle unité
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((u, idx) => {
          const color = PALETTES[idx % PALETTES.length]
          const light = LIGHT[idx % LIGHT.length]
          return (
            <div key={u.id} className={`rounded-xl border p-5 ${light}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white font-bold text-lg`}>
                    {u.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{u.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{u.type.toLowerCase()}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white/60">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(u)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white/60">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => toggleModification(u)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-colors ${
                    u.allowOrderModification
                      ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {u.allowOrderModification ? <Unlock size={13} /> : <Lock size={13} />}
                    Modif. commandes
                  </span>
                  <span className="text-xs font-semibold">{u.allowOrderModification ? 'AUTORISÉ' : 'VERROUILLÉ'}</span>
                </button>

                <button
                  onClick={() => openPassword(u)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <KeyRound size={13} /> Changer le mot de passe
                </button>
              </div>
            </div>
          )
        })}

        {units.length === 0 && (
          <div className="col-span-3 text-center text-gray-400 py-16">Aucune unité configurée</div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Mot de passe par défaut :</strong> <span className="font-mono">1234</span> — Changez-le lors de la première utilisation.
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {modal.mode === 'add' ? 'Nouvelle unité' :
               modal.mode === 'edit' ? `Modifier — ${modal.unit?.name}` :
               `Mot de passe — ${modal.unit?.name}`}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(modal.mode === 'add' || modal.mode === 'edit') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom affiché</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}
              {modal.mode === 'add' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant (URL)</label>
                  <input
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value.toLowerCase().replace(/\s+/g, '') }))}
                    required placeholder="ex: cuisine"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">Minuscules, sans espace. Utilisé pour l&apos;URL et la connexion.</p>
                </div>
              )}
              {(modal.mode === 'add' || modal.mode === 'password') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {modal.mode === 'add' ? 'Mot de passe' : 'Nouveau mot de passe'}
                    </label>
                    <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
                    <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </>
              )}
              {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? '...' : modal.mode === 'add' ? 'Créer' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
