'use client'

import { useEffect, useState } from 'react'
import { Calendar, PlusCircle } from 'lucide-react'
import { toDateInputValue } from '@/lib/utils'

type Category = { id: string; name: string }
type Product = { id: string; name: string; unit: string; unitType: string; category: Category | null }
type UnitInfo = { type: string; name: string; allowOrderModification: boolean }
type ProductsData = { units: UnitInfo[]; products: Record<string, Product[]> }
type QuantityMap = Record<string, number>

const PALETTES = [
  { border: 'border-orange-200 bg-orange-50', dot: 'bg-orange-500', tab: 'bg-orange-50 text-orange-700 border-orange-200' },
  { border: 'border-amber-200 bg-amber-50', dot: 'bg-amber-500', tab: 'bg-amber-50 text-amber-700 border-amber-200' },
  { border: 'border-red-200 bg-red-50', dot: 'bg-red-500', tab: 'bg-red-50 text-red-700 border-red-200' },
  { border: 'border-emerald-200 bg-emerald-50', dot: 'bg-emerald-500', tab: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { border: 'border-blue-200 bg-blue-50', dot: 'bg-blue-500', tab: 'bg-blue-50 text-blue-700 border-blue-200' },
  { border: 'border-purple-200 bg-purple-50', dot: 'bg-purple-500', tab: 'bg-purple-50 text-purple-700 border-purple-200' },
]

export default function AjoutPage() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [date, setDate] = useState(toDateInputValue(tomorrow))
  const [lockedUnits, setLockedUnits] = useState<UnitInfo[]>([])
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [unitIdxMap, setUnitIdxMap] = useState<Record<string, number>>({})
  const [selectedUnit, setSelectedUnit] = useState('')
  const [quantities, setQuantities] = useState<QuantityMap>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/cafeteria/products').then(r => r.json()).then((d: ProductsData) => {
      const locked = d.units.filter(u => !u.allowOrderModification)
      const idxMap: Record<string, number> = {}
      d.units.forEach((u, i) => { idxMap[u.type] = i })
      setLockedUnits(locked)
      setProducts(d.products)
      setUnitIdxMap(idxMap)
      if (locked.length) setSelectedUnit(locked[0].type)
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

  const currentProducts = products[selectedUnit] ?? []
  const grouped = groupByCategory(currentProducts)
  const unitIdx = unitIdxMap[selectedUnit] ?? 0
  const palette = PALETTES[unitIdx % PALETTES.length]
  const currentUnit = lockedUnits.find(u => u.type === selectedUnit)
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
        body: JSON.stringify({ type: 'ADD', deliveryDate: date, items }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      setSuccess('Demande d\'ajout envoyée !')
      setQuantities({})
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demande d&apos;ajout</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sélectionnez les produits à ajouter à votre commande</p>
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

      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
        <PlusCircle size={14} className="inline mr-1" />
        Cette demande sera visible par le chef comme une alerte. Le chef traitera l&apos;ajout manuellement.
      </div>

      {/* Unit tabs (only if multiple locked units) */}
      {lockedUnits.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {lockedUnits.map(u => {
            const idx = unitIdxMap[u.type] ?? 0
            const p = PALETTES[idx % PALETTES.length]
            const active = u.type === selectedUnit
            return (
              <button
                key={u.type}
                onClick={() => setSelectedUnit(u.type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  active ? p.tab : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                {u.name}
              </button>
            )
          })}
        </div>
      )}

      {success && <p className="text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl text-sm font-medium">{success}</p>}
      {error && <p className="text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-sm">{error}</p>}

      {lockedUnits.length === 0 ? (
        <div className="text-center text-gray-400 py-16">Aucune unité avec modification verrouillée</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={`rounded-xl border ${palette.border} overflow-hidden`}>
            <div className="flex items-center gap-3 px-5 py-3 border-b border-inherit">
              <div className={`w-3 h-3 rounded-full ${palette.dot}`} />
              <h2 className="font-semibold text-gray-900">{currentUnit?.name}</h2>
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
                          className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button type="button" onClick={() => setQuantities(q => ({ ...q, [p.id]: (q[p.id] ?? 0) + 1 }))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {currentProducts.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">Aucun produit disponible</p>
              )}
            </div>
          </div>

          {totalItems > 0 && (
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 shadow-sm"
              >
                <PlusCircle size={16} />
                {loading ? 'Envoi...' : `Envoyer la demande (${totalItems} produit${totalItems !== 1 ? 's' : ''})`}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
