'use client'

import { useEffect, useState } from 'react'
import { Calendar, XCircle } from 'lucide-react'
import { toDateInputValue } from '@/lib/utils'

type Category = { id: string; name: string }
type Product = { id: string; name: string; unit: string; unitType: string; category: Category | null }
type UnitInfo = { type: string; name: string; allowOrderModification: boolean }
type ProductsData = { units: UnitInfo[]; products: Record<string, Product[]> }
type QuantityMap = Record<string, number>

const PALETTES = [
  { border: 'border-orange-200 bg-orange-50', dot: 'bg-orange-500', text: 'text-orange-700' },
  { border: 'border-amber-200 bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700' },
  { border: 'border-red-200 bg-red-50', dot: 'bg-red-500', text: 'text-red-700' },
  { border: 'border-emerald-200 bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  { border: 'border-blue-200 bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-700' },
  { border: 'border-purple-200 bg-purple-50', dot: 'bg-purple-500', text: 'text-purple-700' },
]

export default function AnnulationPage() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [date, setDate] = useState(toDateInputValue(tomorrow))
  const [data, setData] = useState<ProductsData>({ units: [], products: {} })
  const [quantities, setQuantities] = useState<QuantityMap>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/cafeteria/products').then(r => r.json()).then((d: ProductsData) => {
      const lockedUnits = d.units.filter(u => !u.allowOrderModification)
      const lockedProducts: Record<string, Product[]> = {}
      for (const u of lockedUnits) {
        lockedProducts[u.type] = d.products[u.type] ?? []
      }
      setData({ units: lockedUnits, products: lockedProducts })
    })
  }, [])

  function groupByCategory(prods: Product[]) {
    const map: Record<string, Product[]> = {}
    for (const p of prods) {
      const key = p.category?.name ?? 'Autres'
      if (!map[key]) map[key] = []
      map[key].push(p)
    }
    return map
  }

  const totalItems = Object.values(quantities).filter(q => q > 0).length
  const minDate = toDateInputValue(new Date())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      const items = Object.entries(quantities)
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => ({ productId, quantity }))

      if (items.length === 0) { setError('Sélectionnez au moins un produit'); setLoading(false); return }

      const res = await fetch('/api/cafeteria/amendments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CANCEL', deliveryDate: date, items }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      setSuccess('Demande d\'annulation envoyée !')
      setQuantities({})
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demande d&apos;annulation</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sélectionnez les produits à annuler dans votre commande</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="date" value={date} min={minDate}
            onChange={e => setDate(e.target.value)}
            className="text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
        <XCircle size={14} className="inline mr-1" />
        Cette demande sera visible par le chef comme une alerte. Le chef traitera l&apos;annulation manuellement.
      </div>

      {success && <p className="text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl text-sm font-medium">{success}</p>}
      {error && <p className="text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-sm">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {data.units.map((unitInfo, unitIdx) => {
            const prods = data.products[unitInfo.type] ?? []
            if (prods.length === 0) return null
            const palette = PALETTES[unitIdx % PALETTES.length]
            const grouped = groupByCategory(prods)

            return (
              <div key={unitInfo.type} className={`rounded-xl border ${palette.border} overflow-hidden`}>
                <div className="flex items-center gap-3 px-5 py-3 border-b border-inherit">
                  <div className={`w-3 h-3 rounded-full ${palette.dot}`} />
                  <h2 className="font-semibold text-gray-900">{unitInfo.name}</h2>
                </div>
                <div className="bg-white">
                  {Object.entries(grouped).map(([catName, catProds]) => (
                    <div key={catName}>
                      <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{catName}</p>
                      </div>
                      {catProds.map(p => (
                        <div key={p.id} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.unit}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setQuantities(q => ({ ...q, [p.id]: Math.max(0, (q[p.id] ?? 0) - 1) }))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold">−</button>
                            <input
                              type="number" min="0" step="0.5"
                              value={quantities[p.id] ?? 0}
                              onChange={e => setQuantities(q => ({ ...q, [p.id]: parseFloat(e.target.value) || 0 }))}
                              className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <button type="button" onClick={() => setQuantities(q => ({ ...q, [p.id]: (q[p.id] ?? 0) + 1 }))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {data.units.length === 0 && (
            <div className="text-center text-gray-400 py-16">Aucune unité avec modification verrouillée</div>
          )}
        </div>

        {totalItems > 0 && (
          <div className="mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 shadow-sm"
            >
              <XCircle size={16} />
              {loading ? 'Envoi...' : `Envoyer la demande (${totalItems} produit${totalItems !== 1 ? 's' : ''})`}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
