import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { verifyCustomerToken } from '@/lib/auth-customer'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CheckCircle2, MapPin, Phone, Clock, Scissors, Star,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { BookButton, BookButtonCard } from './book-button'
import { BookingModal } from './booking-modal'

const BUSINESS_TYPES: Record<string, string> = {
  salao: 'Salão de Beleza', barbearia: 'Barbearia', clinica: 'Clínica',
  estudio: 'Estúdio', spa: 'Spa', outros: 'Profissional',
  dentista: 'Dentista', psicologo: 'Psicólogo', estetica: 'Estética',
  massagem: 'Massagem', nutricionista: 'Nutricionista',
  fisioterapia: 'Fisioterapia', personal: 'Personal Trainer',
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default async function ProfissionalPage({
  params,
}: {
  params: { slug: string }
}) {
  const professional = await prisma.professional.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      businessName: true,
      businessType: true,
      address: true,
      addressNumber: true,
      zipCode: true,
      city: true,
      state: true,
      phone: true,
      image: true,
      bio: true,
      isDemo: true,
      pixKey: true,
      plan: true,
      services: {
        where: { active: true },
        select: { id: true, name: true, duration: true, price: true, description: true },
        orderBy: { name: 'asc' },
      },
      availability: {
        where: { active: true },
        select: { dayOfWeek: true, startTime: true, endTime: true },
        orderBy: { dayOfWeek: 'asc' },
      },
      teamMembers: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, role: true, image: true },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, rating: true, comment: true, clientName: true, createdAt: true },
      },
    },
  })

  if (!professional) notFound()

  // Read client auth server-side — no HTTP fetch needed
  const cookieStore = cookies()
  const clientToken = cookieStore.get('cliente_token')?.value
  let initialClient: { id: string; name: string; email: string; phone: string } | null = null
  if (clientToken) {
    const payload = verifyCustomerToken(clientToken)
    if (payload) {
      const account = await prisma.clientAccount.findUnique({
        where: { id: payload.id },
        select: { id: true, name: true, email: true, phone: true },
      })
      initialClient = account
    }
  }

  const typeLabel  = BUSINESS_TYPES[professional.businessType ?? ''] ?? 'Profissional'
  const addrLine   = [professional.address, professional.addressNumber].filter(Boolean).join(', ')
  const fullAddr   = [addrLine || null, professional.zipCode, professional.city, professional.state].filter(Boolean).join(', ')
  const mapsUrl    = fullAddr ? `https://maps.google.com/?q=${encodeURIComponent(fullAddr)}` : null
  const avgRating  = professional.reviews.length > 0
    ? professional.reviews.reduce((s, r) => s + r.rating, 0) / professional.reviews.length
    : 0
  const pixKeyForModal = professional.plan === 'PRO' ? (professional.pixKey ?? null) : null

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Sticky header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-1.5 group shrink-0">
            <div className="bg-blue-600 rounded-lg p-1 group-hover:bg-blue-700 transition-colors">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-gray-900 text-base">Markou</span>
          </Link>

          <span className="text-sm font-semibold text-gray-700 truncate hidden sm:block">
            {professional.businessName}
          </span>

          {initialClient ? (
            <Link href="/cliente/reservas"
              className="shrink-0 text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              Minhas reservas
            </Link>
          ) : (
            <Link href="/cliente/login"
              className="shrink-0 text-sm font-semibold px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors">
              Entrar
            </Link>
          )}
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div className="w-full overflow-hidden border-b border-gray-200" style={{ height: '300px' }}>
        <div className="max-w-5xl mx-auto h-full flex">
          {/* Left: large photo */}
          <div className="flex-1 overflow-hidden bg-gray-900">
            {professional.image
              ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={professional.image} alt={professional.businessName ?? 'Foto do estabelecimento'} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <Scissors className="h-24 w-24 text-gray-700" />
                </div>
            }
          </div>
          {/* Right: name card */}
          <div className="w-64 sm:w-80 shrink-0 flex items-center justify-center bg-white border-l border-gray-200 px-6 py-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase leading-tight tracking-tight text-center">
              {professional.businessName}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Profile row ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-20 h-20 shrink-0 border-2 border-gray-400 flex items-center justify-center overflow-hidden bg-white">
                {professional.image
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={professional.image} alt={professional.businessName ?? 'Logo'} className="w-full h-full object-cover" />
                  : <span className="text-[10px] font-black text-gray-900 text-center px-1 uppercase leading-tight">
                      {professional.businessName}
                    </span>
                }
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-gray-900 uppercase leading-tight truncate">{professional.businessName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{typeLabel}</p>
                {professional.reviews.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-sm font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">({professional.reviews.length} avaliações)</span>
                  </div>
                )}
              </div>
            </div>
            {/* Map embed */}
            {fullAddr && (
              <div className="hidden sm:block w-64 shrink-0 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(fullAddr)}&output=embed&z=15`}
                  width="100%" height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localização"
                />
              </div>
            )}
          </div>
        </div>

        {professional.isDemo && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-2.5 text-sm text-amber-800 text-center font-medium">
            Perfil de demonstração — agendamentos não disponíveis
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* ── Left: services ── */}
          <div className="space-y-10">

            {/* Quick-book cards */}
            {professional.services.length > 0 && (
              <section>
                <h2 className="text-lg font-extrabold text-gray-900 mb-4">Mais agendados</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                  {professional.services.map(svc => (
                    <div key={svc.id}
                      className="snap-start shrink-0 w-44 bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                      <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{svc.name}</p>
                      <p className="text-xs text-gray-500">{svc.duration} min</p>
                      <div className="text-xs text-gray-500">
                        A partir de:<br />
                        <span className="text-base font-extrabold text-gray-900">{formatCurrency(svc.price)}</span>
                      </div>
                      <BookButtonCard serviceId={svc.id} isDemo={professional.isDemo} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Full service list */}
            {professional.services.length > 0 && (
              <section>
                <h2 className="text-lg font-extrabold text-gray-900 mb-3">Todos os serviços</h2>
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                  {professional.services.map(svc => (
                    <div key={svc.id}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{svc.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{svc.duration} min · {formatCurrency(svc.price)}</p>
                        {svc.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{svc.description}</p>
                        )}
                      </div>
                      <BookButton serviceId={svc.id} isDemo={professional.isDemo} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {professional.services.length === 0 && (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <Scissors className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">Nenhum serviço disponível no momento</p>
              </div>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <aside className="space-y-4 lg:mt-0">

            {fullAddr && (
              <div className="sm:hidden bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700 leading-snug">{fullAddr}</p>
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-semibold text-gray-500 hover:underline mt-1 inline-block">
                        Ver no mapa
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {professional.availability.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-900">Horários</h3>
                </div>
                <div className="space-y-1.5">
                  {professional.availability.map(a => (
                    <div key={a.dayOfWeek} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 w-10 shrink-0">{DAY_NAMES[a.dayOfWeek]}</span>
                      <span className="text-gray-800 font-medium text-xs">{a.startTime} às {a.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {professional.phone && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={`tel:${professional.phone}`}
                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors font-medium">
                    {professional.phone}
                  </a>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ── Nossa equipe ── */}
      {professional.teamMembers.length > 0 && (
        <div className="max-w-5xl mx-auto w-full px-4 pb-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Nossa equipe</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
            {professional.teamMembers.map(member => (
              <div key={member.id}
                className="snap-start shrink-0 w-44 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm text-center">
                {member.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.image} alt={member.name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-blue-50 flex items-center justify-center">
                    <span className="text-4xl font-extrabold text-blue-600">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="p-3">
                  <p className="font-bold text-gray-900 text-sm leading-snug">{member.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Avaliações ── */}
      {professional.reviews.length > 0 && (
        <div className="max-w-5xl mx-auto w-full px-4 pb-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-5">Avaliações dos nossos clientes</h2>

          <div className="flex items-end gap-4 mb-6">
            <span className="text-5xl font-extrabold text-gray-900 leading-none">{avgRating.toFixed(1)}</span>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`h-5 w-5 ${n <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-500">{professional.reviews.length} avaliação{professional.reviews.length !== 1 ? 'ões' : ''}</p>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {professional.reviews.map(review => (
              <div key={review.id} className="py-4 first:pt-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-800">{review.rating.toFixed(1)}</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 mb-1.5 leading-relaxed">{review.comment}</p>
                )}
                <p className="text-xs text-gray-400">
                  {review.clientName}, em {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sobre ── */}
      {professional.bio && (
        <div className="max-w-5xl mx-auto w-full px-4 pb-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-3">Sobre</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{professional.bio}</p>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="bg-gray-950 text-gray-500 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-xl p-1">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">Markou</span>
          </div>
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Markou. Todos os direitos reservados.</p>
          <div className="flex gap-5 text-xs">
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/para-profissionais" className="hover:text-white transition-colors">Para profissionais</Link>
          </div>
        </div>
      </footer>

      {/* ── Booking Modal (client component) ── */}
      <BookingModal
        services={professional.services}
        slug={params.slug}
        initialClient={initialClient}
        isDemo={professional.isDemo}
        plan={professional.plan}
        pixKey={pixKeyForModal}
        businessName={professional.businessName ?? ''}
        fullAddr={fullAddr}
      />
    </div>
  )
}
