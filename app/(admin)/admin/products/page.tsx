'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'

type UnitInfo = { id: string; type: string; name: string }
type Category = { id: string; name: string; unitType: string }
type Product = { id: string; name: string; unit: string; unitType: string; active: boolean; category: Category | null }

const TAB_COLORS = [
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-red-50 text-red-700 border-red-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-purple-50 text-purple-700 border-purple-200',
]
const DOT_COLORS = [
  'bg-orange-500', 'bg-amber-500', 'bg-red-500',
  'bg-emerald-500', 'bg-blue-500', 'bg-purple-500',
]

export default function ProductsPage() {
  const [unitList, setUnitList] = useState<UnitInfo[]>([])
  const [tab, setTab] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', unit: 'kg', categoryId: '', newCategory: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const [units, p, c] = await Promise.all([
      fetch('/api/admin/units').then(r => r.json()),
      fetch('/api/admin/products').then(r => r.json()),
      fetch('/api/admin/categories').then(r => r.json()),
    ])
    const unitArr: UnitInfo[] = Array.isArray(units) ? units : []
    setUnitList(unitArr)
    if (unitArr.length && !tab) setTab(unitArr[0].type)
    setProducts(p)
    setCategories(c)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const tabUnit = unitList.find(u => u.type === tab)
  const filtered = products.filter(p => p.unitType === tab)
  const filteredCats = categories.filter(c => c.unitType === tab)

  function openAdd() {
    setEditing(null); setForm({ name: '', unit: 'kg', categoryId: '', newCategory: '' }); setError(''); setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditing(p); setForm({ name: p.name, unit: p.unit, categoryId: p.category?.id ?? '', newCategory: '' }); setError(''); setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const body: Record<string, string> = { name: form.name, unit: form.unit, unitType: tab }
      if (form.newCategory) body.newCategory = form.newCategory
      else if (form.categoryId) body.categoryId = form.categoryId

      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products'
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error); return }
      setShowModal(false); load()
    } catch { setError('Erreur serveur') }
    finally { setLoading(false) }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Supprimer "${p.name}" ?`)) return
    await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' })
    load()
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        <button onClick={openAdd} disabled={!tab} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
          <Plus size={16} /> Ajouter un produit
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {unitList.map((u, idx) => (
          <button
            key={u.type}
            onClick={() => setTab(u.type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              tab === u.type ? TAB_COLORS[idx % TAB_COLORS.length] : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${DOT_COLORS[idx % DOT_COLORS.length]}`} />
            {u.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produit</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Catégorie</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Unité</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-5 py-3 text-gray-500">{p.category?.name ?? '—'}</td>
                <td className="px-5 py-3 text-gray-500">{p.unit}</td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleActive(p)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.active ? 'Actif' : 'Inactif'}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-blue-600 p-1 rounded"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(p)} className="text-gray-400 hover:text-red-600 p-1 rounded"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                {tab ? `Aucun produit pour ${tabUnit?.name ?? tab}` : 'Sélectionnez une unité'}
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editing ? 'Modifier le produit' : `Nouveau produit — ${tabUnit?.name ?? tab}`}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unité de mesure</label>
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['kg', 'g', 'litre', 'dl', 'pièce', 'portion', 'plateau', 'barquette', 'sachet'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value, newCategory: '' }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Sans catégorie —</option>
                  {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ou créer une nouvelle catégorie</label>
                <input value={form.newCategory} onChange={e => setForm(f => ({ ...f, newCategory: e.target.value, categoryId: '' }))} placeholder="Nom de la catégorie" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? '...' : editing ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
