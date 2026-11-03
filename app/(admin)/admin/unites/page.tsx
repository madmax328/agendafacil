'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'

const UNITS = [
  { type: 'CUISINE', name: 'Cuisine', color: 'bg-orange-500', light: 'bg-orange-50 border-orange-200', text: 'text-orange-700', login: 'cuisine' },
  { type: 'BOULANGERIE', name: 'Boulangerie', color: 'bg-amber-500', light: 'bg-amber-50 border-amber-200', text: 'text-amber-700', login: 'boulangerie' },
  { type: 'PIZZERIA', name: 'Pizzeria', color: 'bg-red-500', light: 'bg-red-50 border-red-200', text: 'text-red-700', login: 'pizzeria' },
]

export default function UnitesPage() {
  const [modal, setModal] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function openModal(type: string) {
    setModal(type); setPassword(''); setConfirm(''); setError(''); setSuccess('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch(`/api/admin/units/${modal}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      setSuccess('Mot de passe mis à jour')
      setModal(null)
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Unités de production</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez les mots de passe de connexion des unités</p>
      </div>

      {success && <p className="text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg text-sm">{success}</p>}

      <div className="grid grid-cols-3 gap-4">
        {UNITS.map(u => (
          <div key={u.type} className={`rounded-xl border p-6 ${u.light}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${u.color} flex items-center justify-center text-white font-bold text-lg`}>
                {u.name[0]}
              </div>
              <div>
                <p className={`font-bold text-lg ${u.text}`}>{u.name}</p>
                <p className="text-xs text-gray-500">Identifiant : <span className="font-mono">{u.login}</span></p>
              </div>
            </div>
            <button
              onClick={() => openModal(u.type)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded-lg w-full justify-center hover:bg-gray-50 transition-colors"
            >
              <KeyRound size={14} />
              Changer le mot de passe
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Mots de passe par défaut :</strong> <span className="font-mono">1234</span> — Changez-les lors de la première utilisation.
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Mot de passe — {UNITS.find(u => u.type === modal)?.name}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? '...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
