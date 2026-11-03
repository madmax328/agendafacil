'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

type OrderItem = { id: string; quantity: number; notes: string | null; product: { name: string; unit: string; unitType: string } }
type Order = { id: string; deliveryDate: string; status: string; items: OrderItem[]; createdAt: string }

const STATUS_LABELS: Record<string, string> = { PENDING: 'En attente', CONFIRMED: 'Confirmée', DELIVERED: 'Livrée' }
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
}
const UNIT_TEXT: Record<string, string> = {
  CUISINE: 'text-orange-600',
  BOULANGERIE: 'text-amber-600',
  PIZZERIA: 'text-red-600',
}

export default function HistoriquePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/cafeteria/orders/all').then(r => r.json()).then(setOrders)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Historique des commandes</h1>

      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div>
                <p className="font-semibold text-gray-900">Livraison : {formatDateShort(order.deliveryDate)}</p>
                <p className="text-sm text-gray-500">Commandé le {formatDateShort(order.createdAt)} · {order.items.length} article(s)</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
                {expanded === order.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>

            {expanded === order.id && (
              <div className="border-t border-gray-100 px-5 py-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left py-1">Produit</th>
                      <th className="text-left py-1">Unité</th>
                      <th className="text-left py-1">Quantité</th>
                      <th className="text-left py-1">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id} className="border-t border-gray-50">
                        <td className="py-2 font-medium">{item.product.name}</td>
                        <td className={`py-2 text-xs font-medium ${UNIT_TEXT[item.product.unitType]}`}>{item.product.unitType}</td>
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
            Aucune commande passée
          </div>
        )}
      </div>
    </div>
  )
}
