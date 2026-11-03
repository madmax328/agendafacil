import { prisma } from '@/lib/prisma'
import { Store, Package, ClipboardList, Clock } from 'lucide-react'
import { formatDateShort, startOfDay, endOfDay } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const today = new Date()
  const [cafeterias, products, ordersToday, ordersPending] = await Promise.all([
    prisma.cafeteria.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true } }),
    prisma.order.count({
      where: { deliveryDate: { gte: startOfDay(today), lte: endOfDay(today) } },
    }),
    prisma.order.count({ where: { status: 'PENDING' } }),
  ])

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      cafeteria: { select: { name: true } },
      items: { select: { id: true } },
    },
  })

  const stats = [
    { label: 'Cafétérias actives', value: cafeterias, icon: Store, color: 'bg-blue-50 text-blue-600' },
    { label: 'Produits actifs', value: products, icon: Package, color: 'bg-green-50 text-green-600' },
    { label: "Livraisons aujourd'hui", value: ordersToday, icon: ClipboardList, color: 'bg-orange-50 text-orange-600' },
    { label: 'Commandes en attente', value: ordersPending, icon: Clock, color: 'bg-purple-50 text-purple-600' },
  ]

  const statusLabels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    DELIVERED: 'Livrée',
  }
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-0.5">{formatDateShort(today)}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Commandes récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cafétéria</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Livraison</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Articles</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{order.cafeteria.name}</td>
                  <td className="px-5 py-3 text-gray-600">{formatDateShort(order.deliveryDate)}</td>
                  <td className="px-5 py-3 text-gray-600">{order.items.length}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Aucune commande</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
