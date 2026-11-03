'use client'

import { useEffect, useState, useCallback } from 'react'
import { Calendar, Lock, ShoppingCart } from 'lucide-react'
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

export default function CafeteriaOrderPage() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [date, setDate] = useState(toDateInputValue(tomorrow))
  const [data, setData] = useState<ProductsData>({ units: [], products: {} })
  const [selectedUnit, setSelectedUnit] = useState('')
  const [quantities, setQuantities] = useState<QuantityMap>({})
  const [originalQuantities, setOriginalQuantities] = useState<QuantityMap>({})
  const [existingOrderId, setExistingOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/cafeteria/products').then(r => r.json()).then((d: ProductsData) => {
      setData(d)
      if (d.units.length) setSelectedUnit(u => u || d.units[0].type)
    })
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

  const currentUnit = data.units.find(u => u.type === selectedUnit)
  const currentProducts = data.products[selectedUnit] ?? []
  const isCurrentLocked = !!(existingOrderId && currentUnit && !currentUnit.allowOrderModification)

  const totalItems = Object.values(quantities).filter(q => q > 0).length

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

  const unitIdx = data.units.findIndex(u => u.type === selectedUnit)
  const palette = PALETTES[unitIdx >= 0 ? unitIdx % PALETTES.length : 0]
  const grouped = groupByCategory(currentProducts)
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

      {/* Unit tabs */}
      <div className="flex gap-2 flex-wrap">
        {data.units.map((u, idx) => {
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
              {existingOrderId && !u.allowOrderModification && (
                <Lock size={11} className="ml-0.5 opacity-60" />
              )}
            </button>
          )
        })}
      </div>

      {success && <p className="text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl text-sm font-medium">{success}</p>}
      {error && <p className="text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isCurrentLocked ? (
          <div className={`rounded-xl border ${palette.border} p-6 text-center`}>
            <Lock size={24} className="mx-auto text-orange-400 mb-2" />
            <p className="font-semibold text-gray-800 mb-1">Modification verrouillée — {currentUnit?.name}</p>
            <p className="text-sm text-gray-500">
              Les commandes pour cette unité ne peuvent plus être modifiées.<br />
              Utilisez <strong>Demande d&apos;ajout</strong> ou <strong>Demande d&apos;annulation</strong> dans le menu de gauche.
            </p>
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center text-gray-400">
            Aucun produit disponible
          </div>
        ) : (
          <>
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

            {totalItems > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{totalItems} produit{totalItems !== 1 ? 's' : ''} sélectionné{totalItems !== 1 ? 's' : ''}</p>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 shadow-sm"
                >
                  <ShoppingCart size={16} />
                  {loading ? 'Envoi...' : existingOrderId ? 'Mettre à jour' : 'Passer la commande'}
                </button>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  )
}
