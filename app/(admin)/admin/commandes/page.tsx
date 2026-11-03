'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

type OrderItem = { id: string; quantity: number; notes: string | null; product: { name: string; unit: string; unitType: string } }
type Order = {
  id: string
  deliveryDate: string
  status: string
  notes: string | null
  cafeteria: { name: string }
  items: OrderItem[]
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = { PENDING: 'En attente', CONFIRMED: 'Confirmée', DELIVERED: 'Livrée' }
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
}
const UNIT_COLORS: Record<string, string> = {
  CUISINE: 'text-orange-600',
  BOULANGERIE: 'text-amber-600',
  PIZZERIA: 'text-red-600',
}

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [dateFilter, setDateFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    const url = dateFilter ? `/api/admin/orders?date=${dateFilter}` : '/api/admin/orders'
    const data = await fetch(url).then(r => r.json())
    setOrders(data)
  }

  useEffect(() => { load() }, [dateFilter])

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{order.cafeteria.name}</p>
                  <p className="text-sm text-gray-500">Livraison : {formatDateShort(order.deliveryDate)} · {order.items.length} article(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={order.status}
                  onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value) }}
                  onClick={e => e.stopPropagation()}
                  className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[order.status]}`}
                >
                  <option value="PENDING">En attente</option>
                  <option value="CONFIRMED">Confirmée</option>
                  <option value="DELIVERED">Livrée</option>
                </select>
                {expanded === order.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>

            {expanded === order.id && (
              <div className="border-t border-gray-100 px-5 py-4 overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left py-1">Produit</th>
                      <th className="text-left py-1">Unité prod.</th>
                      <th className="text-left py-1">Quantité</th>
                      <th className="text-left py-1">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id} className="border-t border-gray-50">
                        <td className="py-2 font-medium">{item.product.name}</td>
                        <td className={`py-2 text-xs font-medium ${UNIT_COLORS[item.product.unitType]}`}>
                          {item.product.unitType}
                        </td>
                        <td className="py-2 text-gray-700">{item.quantity} {item.product.unit}</td>
                        <td className="py-2 text-gray-400 text-xs">{item.notes ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-12 text-center text-gray-400">
            Aucune commande{dateFilter ? ' pour cette date' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
