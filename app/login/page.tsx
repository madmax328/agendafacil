'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

type UnitOption = { value: string; label: string }
type Identifiers = { units: UnitOption[]; cafeterias: string[] }

export default function LoginPage() {
  const [identifiers, setIdentifiers] = useState<Identifiers>({ units: [], cafeterias: [] })
  const [selected, setSelected] = useState('')
  const [password, setPassword] = useState('')
  const [adminMode, setAdminMode] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/public/identifiers').then(r => r.json()).then(setIdentifiers).catch(() => {})
  }, [])

  const identifier = adminMode ? adminEmail : selected

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!identifier) { setError('Sélectionnez votre identifiant'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Identifiants incorrects'); return }
      window.location.assign(data.redirect)
    } catch {
      setError('Erreur de connexion, réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Artigus SA" width={160} height={50} className="h-12 w-auto mx-auto mb-4" />
          <p className="text-gray-500 text-sm mt-1">Gestion des commandes</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {adminMode ? 'Email administrateur' : 'Qui êtes-vous ?'}
            </label>

            {adminMode ? (
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder="admin@artigus.ch"
                required
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="relative">
                <select
                  value={selected}
                  onChange={e => setSelected(e.target.value)}
                  required
                  className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-8"
                >
                  <option value="">— Sélectionner —</option>

                  {identifiers.units.length > 0 && (
                    <optgroup label="Unités de production">
                      {identifiers.units.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </optgroup>
                  )}

                  {identifiers.cafeterias.length > 0 && (
                    <optgroup label="Cafétérias">
                      {identifiers.cafeterias.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </optgroup>
                  )}

                  {identifiers.units.length === 0 && identifiers.cafeterias.length === 0 && (
                    <option disabled>Chargement...</option>
                  )}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => { setAdminMode(!adminMode); setError(''); setSelected(''); setAdminEmail('') }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            {adminMode ? '← Retour à la sélection' : 'Connexion administrateur'}
          </button>
        </div>
      </div>
    </div>
  )
}
