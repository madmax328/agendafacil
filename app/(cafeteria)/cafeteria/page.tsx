'use client'

import { useEffect, useState, useCallback } from 'react'
import { ShoppingCart, Calendar } from 'lucide-react'
import { toDateInputValue } from '@/lib/utils'

type Category = { id: string; name: string }
type Product = { id: string; name: string; unit: string; unitType: string; category: Category | null }
type ProductsByUnit = { CUISINE: Product[]; BOULANGERIE: Product[]; PIZZERIA: Product[] }
type QuantityMap = Record<string, number>
type NotesMap = Record<string, string>

const UNIT_LABELS: Record<string, string> = { CUISINE: 'Cuisine', BOULANGERIE: 'Boulangerie', PIZZERIA: 'Pizzeria' }
const UNIT_COLORS: Record<string, string> = {
  CUISINE: 'bg-orange-500',
  BOULANGERIE: 'bg-amber-500',
  PIZZERIA: 'bg-red-500',
}
const UNIT_BORDER: Record<string, string> = {
  CUISINE: 'border-orange-200 bg-orange-50',
  BOULANGERIE: 'border-amber-200 bg-amber-50',
  PIZZERIA: 'border-red-200 bg-red-50',
}

export default function CafeteriaOrderPage() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [date, setDate] = useState(toDateInputValue(tomorrow))
  const [products, setProducts] = useState<ProductsByUnit>({ CUISINE: [], BOULANGERIE: [], PIZZERIA: [] })
  const [quantities, setQuantities] = useState<QuantityMap>({})
  const [notes, setNotes] = useState<NotesMap>({})
  const [existingOrderId, setExistingOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/cafeteria/products').then(r => r.json()).then(setProducts)
  }, [])

  const loadExistingOrder = useCallback(async () => {
    if (!date) return
    const res = await fetch(`/api/cafeteria/orders?date=${date}`)
    if (!res.ok) { setExistingOrderId(null); setQuantities({}); setNotes({}); return }
    const order = await res.json()
    if (!order) { setExistingOrderId(null); setQuantities({}); setNotes({}); return }
    setExistingOrderId(order.id)
    const q: QuantityMap = {}
    const n: NotesMap = {}
    for (const item of order.items) {
      q[item.productId] = item.quantity
      if (item.notes) n[item.productId] = item.notes
    }
    setQuantities(q)
    setNotes(n)
  }, [date])

  useEffect(() => { loadExistingOrder() }, [loadExistingOrder])

  const totalItems = Object.values(quantities).filter(q => q > 0).length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      const items = Object.entries(quantities)
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => ({ productId, quantity, notes: notes[productId] || undefined }))

      if (items.length === 0) { setError('Ajoutez au moins un produit à la commande'); setLoading(false); return }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Passer une commande</h1>
          {existingOrderId && <p className="text-sm text-amber-600 mt-0.5">⚠ Une commande existe déjà pour cette date — vous la modifiez</p>}
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={e => setDate(e.target.value)}
            className="text-sm focus:outline-none"
          />
        </div>
      </div>

      {success && <p className="text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl text-sm font-medium">{success}</p>}
      {error && <p className="text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(['CUISINE', 'BOULANGERIE', 'PIZZERIA'] as const).map(unit => {
          const prods = products[unit]
          if (prods.length === 0) return null
          const grouped = groupByCategory(prods)

          return (
            <div key={unit} className={`rounded-xl border ${UNIT_BORDER[unit]} overflow-hidden`}>
              <div className="flex items-center gap-3 px-5 py-3 border-b border-inherit">
                <div className={`w-3 h-3 rounded-full ${UNIT_COLORS[unit]}`} />
                <h2 className="font-semibold text-gray-900">{UNIT_LABELS[unit]}</h2>
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
                        <input
                          type="text"
                          value={notes[p.id] ?? ''}
                          onChange={e => setNotes(n => ({ ...n, [p.id]: e.target.value }))}
                          placeholder="Notes..."
                          className="w-36 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQuantities(q => ({ ...q, [p.id]: Math.max(0, (q[p.id] ?? 0) - 1) }))}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold"
                          >−</button>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={quantities[p.id] ?? 0}
                            onChange={e => setQuantities(q => ({ ...q, [p.id]: parseFloat(e.target.value) || 0 }))}
                            className="w-16 text-center border border-gray-300 rounded-lg py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantities(q => ({ ...q, [p.id]: (q[p.id] ?? 0) + 1 }))}
                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold"
                          >+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        <div className="sticky bottom-6 no-print">
          <button
            type="submit"
            disabled={loading || totalItems === 0}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 shadow-lg"
          >
            <ShoppingCart size={18} />
            {loading ? 'Envoi...' : existingOrderId ? `Mettre à jour (${totalItems} produit${totalItems > 1 ? 's' : ''})` : `Envoyer la commande (${totalItems} produit${totalItems > 1 ? 's' : ''})`}
          </button>
        </div>
      </form>
    </div>
  )
}
