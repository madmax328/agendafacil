'use client'

import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'

type Category = { id: string; name: string }
type Product = { id: string; name: string; unit: string; category: Category | null }

export default function ProductionProduitsPage({ params }: { params: { unit: string } }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/production/${params.unit}/products`)
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.unit])

  const grouped: Record<string, Product[]> = {}
  for (const p of products) {
    const key = p.category?.name ?? 'Sans catégorie'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(p)
  }
  const categories = Object.keys(grouped).sort((a, b) => a.localeCompare(b, 'fr'))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes produits</h1>
        <p className="text-sm text-gray-500 mt-0.5">{products.length} produit{products.length !== 1 ? 's' : ''} actif{products.length !== 1 ? 's' : ''}</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-16">Chargement...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-16 text-center text-gray-400">
          <Package size={32} className="mx-auto mb-2 opacity-30" />
          Aucun produit configuré pour cette unité
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {categories.map((catName, i) => (
            <div key={catName}>
              {i > 0 && <div className="border-t border-gray-100" />}
              <div className="px-5 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{catName}</p>
              </div>
              {grouped[catName].map(p => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{p.unit}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
