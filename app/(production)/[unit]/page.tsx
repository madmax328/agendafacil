'use client'

import { useEffect, useState, useCallback } from 'react'
import { Printer, Calendar } from 'lucide-react'
import { formatDate, toDateInputValue } from '@/lib/utils'

type OrderItem = { id: string; quantity: number; notes: string | null; product: { name: string; unit: string } }
type CafeteriaOrder = { cafeteriaName: string; items: OrderItem[] }

export default function ProductionOrdersPage({ params }: { params: { unit: string } }) {
  const [date, setDate] = useState(toDateInputValue(new Date()))
  const [orders, setOrders] = useState<CafeteriaOrder[]>([])
  const [total, setTotal] = useState<Record<string, { quantity: number; unit: string }>>({})

  const load = useCallback(async () => {
    const res = await fetch(`/api/production/${params.unit}/orders?date=${date}`)
    const data: CafeteriaOrder[] = await res.json()
    setOrders(data)

    // Aggregate totals
    const agg: Record<string, { quantity: number; unit: string }> = {}
    for (const caf of data) {
      for (const item of caf.items) {
        if (!agg[item.product.name]) agg[item.product.name] = { quantity: 0, unit: item.product.unit }
        agg[item.product.name].quantity += item.quantity
      }
    }
    setTotal(agg)
  }, [date, params.unit])

  useEffect(() => { load() }, [load])

  const unitLabel = params.unit.charAt(0).toUpperCase() + params.unit.slice(1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes — {unitLabel}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} cafétéria(s) ont commandé</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Printer size={16} />
            Imprimer
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="print-only mb-6">
        <h1 className="text-2xl font-bold">{unitLabel} — Commandes du {formatDate(date)}</h1>
        <p className="text-gray-500">Imprimé le {new Date().toLocaleDateString('fr-CH')}</p>
      </div>

      {/* Récapitulatif total */}
      {Object.keys(total).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Récapitulatif total</h2>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Tous cafétérias confondus</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-2 text-xs font-semibold text-gray-500 uppercase">Produit</th>
                <th className="text-left px-5 py-2 text-xs font-semibold text-gray-500 uppercase">Total à préparer</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(total).map(([name, { quantity, unit }]) => (
                <tr key={name} className="border-t border-gray-100">
                  <td className="px-5 py-2.5 font-medium">{name}</td>
                  <td className="px-5 py-2.5 text-gray-700 font-semibold">{quantity} {unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Détail par cafétéria */}
      {orders.map(caf => (
        <div key={caf.cafeteriaName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-900">{caf.cafeteriaName}</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wide">
                <th className="text-left px-5 py-2">Produit</th>
                <th className="text-left px-5 py-2">Quantité</th>
                <th className="text-left px-5 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {caf.items.map(item => (
                <tr key={item.id} className="border-t border-gray-50">
                  <td className="px-5 py-2.5 font-medium">{item.product.name}</td>
                  <td className="px-5 py-2.5 text-gray-700">{item.quantity} {item.product.unit}</td>
                  <td className="px-5 py-2.5 text-gray-400 text-xs">{item.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {orders.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-16 text-center text-gray-400">
          Aucune commande pour cette date
        </div>
      )}
    </div>
  )
}
