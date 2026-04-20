import { prisma } from '@/lib/prisma'
import { Users } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminProfissionaisPage() {
  const professionals = await prisma.professional.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      businessName: true,
      email: true,
      phone: true,
      plan: true,
      planExpiresAt: true,
      slug: true,
      isDemo: true,
      isFeatured: true,
      createdAt: true,
      _count: { select: { appointments: true, customers: true, services: true } },
    },
  })

  const planLabels: Record<string, string> = { FREE: 'Gratuito', STARTER: 'Starter', PRO: 'Pro' }
  const planColors: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600',
    STARTER: 'bg-blue-100 text-blue-700',
    PRO: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-sm text-gray-500 mt-1">{professionals.length} profissionais registados</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Profissional</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plano</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Agend.</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Clientes</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Serviços</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Inscrito em</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Página</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{p.businessName || p.name || '—'}</div>
                    {p.isDemo && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-medium">DEMO</span>}
                    {p.isFeatured && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium ml-1">DESTAQUE</span>}
                  </td>
                  <td className="py-3 px-4 text-gray-500">{p.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${planColors[p.plan]}`}>
                      {planLabels[p.plan]}
                    </span>
                    {p.planExpiresAt && (
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        até {new Date(p.planExpiresAt).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{p._count.appointments}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{p._count.customers}</td>
                  <td className="py-3 px-4 text-gray-700 font-medium">{p._count.services}</td>
                  <td className="py-3 px-4 text-gray-500">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-4">
                    {p.slug ? (
                      <Link
                        href={`/${p.slug}`}
                        target="_blank"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        /{p.slug}
                      </Link>
                    ) : (
                      <span className="text-gray-300 text-xs">sem slug</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
