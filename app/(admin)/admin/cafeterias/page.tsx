'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

type Cafeteria = { id: string; name: string; active: boolean; createdAt: string }

export default function CafeteriasPage() {
  const [list, setList] = useState<Cafeteria[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Cafeteria | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/admin/cafeterias')
    const data = await res.json()
    setList(data)
  }

  useEffect(() => { load() }, [])

  function openAdd() { setEditing(null); setName(''); setPassword(''); setError(''); setShowModal(true) }
  function openEdit(c: Cafeteria) { setEditing(c); setName(c.name); setPassword(''); setError(''); setShowModal(true) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const url = editing ? `/api/admin/cafeterias/${editing.id}` : '/api/admin/cafeterias'
      const method = editing ? 'PUT' : 'POST'
      const body: Record<string, string> = { name }
      if (password) body.password = password
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      setShowModal(false); load()
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  async function toggleActive(c: Cafeteria) {
    await fetch(`/api/admin/cafeterias/${c.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !c.active }),
    })
    load()
  }

  async function handleDelete(c: Cafeteria) {
    if (!confirm(`Supprimer "${c.name}" ?`)) return
    await fetch(`/api/admin/cafeterias/${c.id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cafétérias</h1>
          <p className="text-sm text-gray-500 mt-0.5">{list.length} cafétéria(s)</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Identifiant de connexion</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-3 text-gray-500 font-mono text-xs">{c.name}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => toggleActive(c)} className="text-gray-400 hover:text-blue-600 p-1 rounded" title={c.active ? 'Désactiver' : 'Activer'}>
                      {c.active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-blue-600 p-1 rounded">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(c)} className="text-gray-400 hover:text-red-600 p-1 rounded">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Aucune cafétéria</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? 'Modifier la cafétéria' : 'Nouvelle cafétéria'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la cafétéria</label>
                <input value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">Ce nom sera aussi l&apos;identifiant de connexion</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe{editing ? ' (laisser vide pour ne pas changer)' : ''}
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!editing} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? '...' : editing ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
