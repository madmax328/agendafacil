'use client'

import { useEffect, useState, useCallback } from 'react'
import { Calendar, X, Lock, ShoppingCart } from 'lucide-react'
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

export default function CafeteriaOrderPage() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [date, setDate] = useState(toDateInputValue(tomorrow))
  const [data, setData] = useState<ProductsData>({ units: [], products: {} })
  const [quantities, setQuantities] = useState<QuantityMap>({})
  const [originalQuantities, setOriginalQuantities] = useState<QuantityMap>({})
  const [existingOrderId, setExistingOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/cafeteria/products').then(r => r.json()).then(setData)
  }, [])

  const loadExistingOrder = useCallback(async () => {
    if (!date) return
    const res = await fetch(`/api/cafeteria/orders?date=${date}`)
    if (!res.ok) { setExistingOrderId(null); setQuantities({}); setOriginalQuantities({}); return }
    const order = await res.json()
    if (!order) { setExistingOrderId(null); setQuantities({}); setOriginalQuantities({}); return }
    setExistingOrderId(order.id)
    const q: QuantityMap = {}
    for (const item of order.items) {
      q[item.productId] = item.quantity
    }
    setQuantities(q)
    setOriginalQuantities(q)
  }, [date])

  useEffect(() => { loadExistingOrder() }, [loadExistingOrder])

  // Products locked from modification: in existing order with qty > 0, unit has locked modification
  const lockedProductIds = new Set<string>()
  if (existingOrderId) {
    const lockedUnitTypes = new Set(data.units.filter(u => !u.allowOrderModification).map(u => u.type))
    for (const unit of data.units) {
      if (!lockedUnitTypes.has(unit.type)) continue
      for (const p of (data.products[unit.type] ?? [])) {
        if ((originalQuantities[p.id] ?? 0) > 0) lockedProductIds.add(p.id)
      }
    }
  }

  const totalItems = Object.values(quantities).filter(q => q > 0).length

  function allProducts(): (Product & { unitIdx: number })[] {
    return data.units.flatMap((u, idx) => (data.products[u.type] ?? []).map(p => ({ ...p, unitIdx: idx })))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      const items = Object.entries(quantities)
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => ({ productId, quantity }))

      if (items.length === 0) { setError('Ajoutez au moins un produit'); setLoading(false); return }

      const url = existingOrderId ? `/api/cafeteria/orders/${existingOrderId}` : '/api/cafeteria/orders'
      const method = existingOrderId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryDate: date, items }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      const saved = await res.json()
      setExistingOrderId(saved.id)
      setSuccess(existingOrderId ? 'Commande mise à jour !' : 'Commande envoyée !')
      setOriginalQuantities(quantities)
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  function groupByCategory(prods: Product[]) {
    const map: Record<string, Product[]> = {}
    for (const p of prods) {
      const key = p.category?.name ?? 'Autres'
      if (!map[key]) map[key] = []
      map[key].push(p)
    }
    return map
  }

  const minDate = toDateInputValue(new Date())

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Passer une commande</h1>
          {existingOrderId && <p className="text-sm text-amber-600 mt-0.5">⚠ Commande existante — vous la modifiez</p>}
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

      {success && <p className="text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl text-sm font-medium">{success}</p>}
      {error && <p className="text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-sm">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6 items-start">
          {/* Left: product list */}
          <div className="flex-1 space-y-4">
            {data.units.map((unitInfo, unitIdx) => {
              const prods = data.products[unitInfo.type] ?? []
              if (prods.length === 0) return null
              const palette = PALETTES[unitIdx % PALETTES.length]
              const grouped = groupByCategory(prods)
              const isLocked = existingOrderId && !unitInfo.allowOrderModification

              return (
                <div key={unitInfo.type} className={`rounded-xl border ${palette.border} overflow-hidden`}>
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-inherit">
                    <div className={`w-3 h-3 rounded-full ${palette.dot}`} />
                    <h2 className="font-semibold text-gray-900">{unitInfo.name}</h2>
                    {isLocked && (
                      <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full ml-auto">
                        <Lock size={10} /> Modification verrouillée
                      </span>
                    )}
                  </div>
                  <div className="bg-white">
                    {Object.entries(grouped).map(([catName, catProds]) => (
                      <div key={catName}>
                        <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{catName}</p>
                        </div>
                        {catProds.map(p => {
                          const locked = lockedProductIds.has(p.id)
                          return (
                            <div key={p.id} className={`flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0 ${locked ? 'bg-orange-50/30' : 'hover:bg-gray-50'}`}>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{p.name}</p>
                                <p className="text-xs text-gray-400">{p.unit}</p>
                              </div>
                              {locked ? (
                                <div className="flex items-center gap-2 text-orange-600">
                                  <Lock size={12} />
                                  <span className="text-sm font-semibold">{quantities[p.id] ?? 0} {p.unit}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => setQuantities(q => ({ ...q, [p.id]: Math.max(0, (q[p.id] ?? 0) - 1) }))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold">−</button>
                                  <input
                                    type="number" min="0" step="0.5"
                                    value={quantities[p.id] ?? 0}
                                    onChange={e => setQuantities(q => ({ ...q, [p.id]: parseFloat(e.target.value) || 0 }))}
                                    className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <button type="button" onClick={() => setQuantities(q => ({ ...q, [p.id]: (q[p.id] ?? 0) + 1 }))} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold">+</button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: order summary panel */}
          <div className="w-72 sticky top-6 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Ma commande</h2>
                <p className="text-xs text-gray-400 mt-0.5">{totalItems} produit{totalItems !== 1 ? 's' : ''} sélectionné{totalItems !== 1 ? 's' : ''}</p>
              </div>

              <div className="divide-y divide-gray-50 max-h-[50vh] overflow-y-auto">
                {totalItems === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Aucun produit sélectionné</p>
                ) : (
                  allProducts()
                    .filter(p => (quantities[p.id] ?? 0) > 0)
                    .map(p => {
                      const locked = lockedProductIds.has(p.id)
                      const palette = PALETTES[p.unitIdx % PALETTES.length]
                      return (
                        <div key={p.id} className="flex items-center gap-2 px-4 py-2.5">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${palette.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                            <p className="text-xs text-gray-400">{quantities[p.id]} {p.unit}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setQuantities(q => ({ ...q, [p.id]: 0 }))}
                            className={`p-1 rounded-lg transition-colors shrink-0 ${locked ? 'text-orange-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'}`}
                            title={locked ? 'Annuler (même si verrouillé)' : 'Retirer'}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )
                    })
                )}
              </div>

              {totalItems > 0 && (
                <div className="p-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <ShoppingCart size={16} />
                    {loading ? 'Envoi...' : existingOrderId ? 'Mettre à jour' : 'Envoyer'}
                  </button>
                </div>
              )}
            </div>

            {existingOrderId && lockedProductIds.size > 0 && (
              <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">
                <Lock size={12} className="inline mr-1" />
                {lockedProductIds.size} produit{lockedProductIds.size > 1 ? 's' : ''} verrouillé{lockedProductIds.size > 1 ? 's' : ''} — vous pouvez les annuler (X) mais pas changer la quantité.
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
