'use client'

import { useEffect, useState, useCallback } from 'react'
import { Printer, Calendar, CheckCircle } from 'lucide-react'
import { formatDate, toDateInputValue } from '@/lib/utils'

type Product = { name: string; unit: string; category: { name: string } | null }
type OrderItem = { id: string; quantity: number; notes: string | null; product: Product }
type CafeteriaOrder = { cafeteriaName: string; items: OrderItem[]; orderId: string; status: string }
type CategoryGroup = { name: string; products: { name: string; quantity: number; unit: string }[] }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'En attente',  color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmée',   color: 'bg-green-100 text-green-700' },
  DELIVERED: { label: 'Livrée',      color: 'bg-blue-100 text-blue-700' },
}

function printElement(id: string, title: string) {
  const el = document.getElementById(id)
  if (!el) return
  const w = window.open('', '_blank', 'width=800,height=600')
  if (!w) return
  const origin = window.location.origin
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:system-ui,sans-serif;font-size:13px;color:#111;padding:28px 32px;max-width:780px;margin:0 auto}
    .logo-header{display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #111}
    .logo-header img{height:44px}
    .logo-header-title{font-size:15px;font-weight:700;color:#111}
    .print-only,.no-print{display:none}
    h2{font-size:14px;font-weight:700;margin:0 0 16px}
    .cat-group{margin-bottom:16px}
    .cat-group:last-child{margin-bottom:0}
    h3{font-size:10px;font-weight:700;text-transform:uppercase;color:#6b7280;letter-spacing:.06em;margin:0 0 4px;padding-bottom:4px;border-bottom:1px solid #e5e7eb}
    table{width:100%;border-collapse:collapse}
    td{padding:5px 0;border-top:1px solid #f3f4f6;font-size:13px}
    td:last-child{text-align:right;font-weight:600}
  </style></head><body>
  <div class="logo-header">
    <img src="${origin}/logo.png" alt="Artigus" />
    <div class="logo-header-title">${title}</div>
  </div>
  ${el.innerHTML}
  </body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print(); w.close() }, 250)
}

export default function ProductionOrdersPage({ params }: { params: { unit: string } }) {
  const [date, setDate] = useState(toDateInputValue(new Date()))
  const [orders, setOrders] = useState<CafeteriaOrder[]>([])
  const [categoryTotals, setCategoryTotals] = useState<CategoryGroup[]>([])
  const [confirming, setConfirming] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/production/${params.unit}/orders?date=${date}`)
    const data: CafeteriaOrder[] = await res.json()
    setOrders(data)

    const catMap: Record<string, Record<string, { quantity: number; unit: string }>> = {}
    for (const caf of data) {
      for (const item of caf.items) {
        const catName = item.product.category?.name ?? 'Sans catégorie'
        if (!catMap[catName]) catMap[catName] = {}
        if (!catMap[catName][item.product.name]) {
          catMap[catName][item.product.name] = { quantity: 0, unit: item.product.unit }
        }
        catMap[catName][item.product.name].quantity += item.quantity
      }
    }

    const groups: CategoryGroup[] = Object.keys(catMap)
      .sort((a, b) => a.localeCompare(b, 'fr'))
      .map(catName => ({
        name: catName,
        products: Object.entries(catMap[catName])
          .sort(([a], [b]) => a.localeCompare(b, 'fr'))
          .map(([name, { quantity, unit }]) => ({ name, quantity, unit })),
      }))
    setCategoryTotals(groups)
  }, [date, params.unit])

  useEffect(() => { load() }, [load])

  async function confirmOrder(orderId: string) {
    setConfirming(orderId)
    try {
      const res = await fetch(`/api/production/${params.unit}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      })
      if (res.ok) load()
    } finally {
      setConfirming(null)
    }
  }

  const unitLabel = params.unit.charAt(0).toUpperCase() + params.unit.slice(1)
  const totalProducts = categoryTotals.reduce((s, c) => s + c.products.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes — {unitLabel}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} cafétéria(s) · {totalProducts} produit(s)</p>
        </div>
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Récapitulatif total */}
      {categoryTotals.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Récapitulatif total</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tous cafétérias confondus</p>
            </div>
            <button
              onClick={() => printElement('recap-total', `${unitLabel} — Récapitulatif ${formatDate(date)}`)}
              className="no-print flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer size={14} /> Imprimer récapitulatif
            </button>
          </div>

          <div id="recap-total" className="px-5 py-4">
            <h1 className="print-only text-xl font-bold mb-1">{unitLabel} — Récapitulatif total</h1>
            <p className="print-only text-gray-500 text-sm mb-4">{formatDate(date)}</p>
            {categoryTotals.map((group, gi) => (
              <div key={group.name} className={`cat-group${gi < categoryTotals.length - 1 ? ' mb-4' : ''}`}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 pb-1 border-b border-gray-100">
                  {group.name}
                </h3>
                <table className="w-full text-sm">
                  <tbody>
                    {group.products.map(p => (
                      <tr key={p.name} className="border-t border-gray-50">
                        <td className="py-1.5 font-medium text-gray-900">{p.name}</td>
                        <td className="py-1.5 text-gray-700 font-semibold text-right">{p.quantity} {p.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Détail par cafétéria */}
      {orders.map((caf, i) => {
        const cafCatMap: Record<string, OrderItem[]> = {}
        for (const item of caf.items) {
          const cat = item.product.category?.name ?? 'Sans catégorie'
          if (!cafCatMap[cat]) cafCatMap[cat] = []
          cafCatMap[cat].push(item)
        }
        const cafGroups = Object.keys(cafCatMap).sort((a, b) => a.localeCompare(b, 'fr')).map(cat => ({
          name: cat,
          items: cafCatMap[cat].sort((a, b) => a.product.name.localeCompare(b.product.name, 'fr')),
        }))
        const st = STATUS_LABELS[caf.status] ?? STATUS_LABELS.PENDING

        return (
          <div key={caf.cafeteriaName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-gray-900">{caf.cafeteriaName}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
              </div>
              <div className="flex items-center gap-2 no-print">
                {caf.status === 'PENDING' && (
                  <button
                    onClick={() => confirmOrder(caf.orderId)}
                    disabled={confirming === caf.orderId}
                    className="flex items-center gap-1.5 text-xs font-medium text-green-700 hover:text-green-900 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                    {confirming === caf.orderId ? '...' : 'Confirmer'}
                  </button>
                )}
                <button
                  onClick={() => printElement(`caf-order-${i}`, `${unitLabel} — ${caf.cafeteriaName} — ${formatDate(date)}`)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors bg-white"
                >
                  <Printer size={14} /> Imprimer
                </button>
              </div>
            </div>
            <div id={`caf-order-${i}`} className="px-5 py-4">
              <h2 className="print-only font-bold text-lg mb-1">{caf.cafeteriaName}</h2>
              <p className="print-only text-gray-500 text-sm mb-4">{unitLabel} · {formatDate(date)}</p>
              {cafGroups.map((group, gi) => (
                <div key={group.name} className={`cat-group${gi < cafGroups.length - 1 ? ' mb-4' : ''}`}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 pb-1 border-b border-gray-100">
                    {group.name}
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {group.items.map(item => (
                        <tr key={item.id} className="border-t border-gray-50">
                          <td className="py-1.5 font-medium text-gray-900">{item.product.name}</td>
                          <td className="py-1.5 text-gray-700 font-semibold text-right">{item.quantity} {item.product.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {orders.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-16 text-center text-gray-400">
          Aucune commande pour cette date
        </div>
      )}
    </div>
  )
}
