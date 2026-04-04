/**
 * Seed script — populates MongoDB with 500+ realistic Brazilian businesses.
 * Run: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// ── Data pools ──────────────────────────────────────────────────────────────

const CITIES: { city: string; state: string }[] = [
  { city: 'São Paulo', state: 'SP' },
  { city: 'Rio de Janeiro', state: 'RJ' },
  { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Curitiba', state: 'PR' },
  { city: 'Porto Alegre', state: 'RS' },
  { city: 'Salvador', state: 'BA' },
  { city: 'Fortaleza', state: 'CE' },
  { city: 'Recife', state: 'PE' },
  { city: 'Manaus', state: 'AM' },
  { city: 'Goiânia', state: 'GO' },
  { city: 'Belém', state: 'PA' },
  { city: 'Florianópolis', state: 'SC' },
  { city: 'Campinas', state: 'SP' },
  { city: 'Natal', state: 'RN' },
  { city: 'Maceió', state: 'AL' },
  { city: 'Campo Grande', state: 'MS' },
  { city: 'Teresina', state: 'PI' },
  { city: 'João Pessoa', state: 'PB' },
  { city: 'Vitória', state: 'ES' },
  { city: 'Ribeirão Preto', state: 'SP' },
]

const BUSINESS_TYPES = [
  'salao', 'barbearia', 'clinica', 'dentista', 'psicologo',
  'fisioterapeuta', 'nutricionista', 'personal', 'manicure',
]

const SALAO_NAMES = [
  'Studio', 'Espaço', 'Salão', 'Beleza', 'Arte', 'Hair', 'Style',
  'Beauty', 'Glam', 'Chique', 'Elegante', 'Premium', 'Top', 'VIP',
]
const BARBER_NAMES = [
  'Barbearia', 'Barber', 'The Barber', 'Old School', 'Vintage', 'Classic',
  'Corte & Arte', 'Navalha', 'Estilo', 'Barba & Cabelo',
]
const CLINICA_NAMES = [
  'Clínica', 'Centro', 'Instituto', 'Espaço Saúde', 'Wellness',
  'Terapia', 'Estética', 'Corpore', 'Vita', 'Sanus',
]
const DENTISTA_NAMES = [
  'OdontoCare', 'Clínica Dental', 'Sorria', 'SmileClinic', 'Dente Saudável',
  'OdontoTop', 'Odontologia', 'Boca & Saúde', 'Branco Sorriso',
]
const PSICO_NAMES = [
  'Psicólogo(a)', 'Terapia', 'Mente Sã', 'Equilíbrio', 'Bem-estar',
  'Psicologia Clínica', 'Cuidado Mental', 'Saúde Psíquica',
]
const FISIO_NAMES = [
  'Fisioterapia', 'FisioCenter', 'Reabilitação', 'Movimento', 'FisioVida',
  'Centro de Fisioterapia', 'Fisio & Saúde',
]
const NUTRI_NAMES = [
  'NutriVida', 'Nutrição', 'Saúde & Nutrição', 'NutriCenter',
  'Vida Saudável', 'Alimentação Saudável', 'NutriConsult',
]
const PERSONAL_NAMES = [
  'Personal Trainer', 'FitLife', 'Corpo em Forma', 'Training',
  'Fitness', 'FitCenter', 'Academia do Corpo',
]
const MANICURE_NAMES = [
  'Esmaltes & Cia', 'Nail Studio', 'Manicure & Pedicure', 'Unhas Perfeitas',
  'Nail Art', 'Studio das Unhas', 'Belle Nails',
]

const FIRST_NAMES = [
  'Ana', 'Maria', 'Carlos', 'João', 'Fernanda', 'Patricia', 'Roberto',
  'Juliana', 'Marcos', 'Camila', 'Lucas', 'Amanda', 'Rafael', 'Beatriz',
  'Pedro', 'Larissa', 'Felipe', 'Gabriela', 'Diego', 'Vanessa',
  'Thiago', 'Leticia', 'Bruno', 'Sandra', 'Eduardo', 'Mariana',
  'Leonardo', 'Claudia', 'Rodrigo', 'Priscila',
]

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa',
  'Ferreira', 'Rodrigues', 'Almeida', 'Nascimento', 'Carvalho',
  'Araújo', 'Gomes', 'Martins', 'Ribeiro', 'Barbosa', 'Rocha',
  'Cardoso', 'Correia', 'Mendes', 'Freitas', 'Cavalcante',
]

const SERVICES_BY_TYPE: Record<string, { name: string; duration: number; price: number }[]> = {
  salao: [
    { name: 'Corte feminino', duration: 60, price: 80 },
    { name: 'Coloração', duration: 120, price: 180 },
    { name: 'Escova progressiva', duration: 180, price: 250 },
    { name: 'Hidratação', duration: 60, price: 90 },
    { name: 'Corte + escova', duration: 90, price: 120 },
    { name: 'Mechas', duration: 150, price: 220 },
  ],
  barbearia: [
    { name: 'Corte masculino', duration: 30, price: 45 },
    { name: 'Barba', duration: 30, price: 35 },
    { name: 'Corte + barba', duration: 60, price: 70 },
    { name: 'Degradê', duration: 45, price: 55 },
    { name: 'Sobrancelha masculina', duration: 20, price: 20 },
  ],
  clinica: [
    { name: 'Limpeza de pele', duration: 60, price: 120 },
    { name: 'Peeling químico', duration: 45, price: 150 },
    { name: 'Microagulhamento', duration: 60, price: 200 },
    { name: 'Botox', duration: 30, price: 350 },
    { name: 'Harmonização facial', duration: 90, price: 500 },
    { name: 'Laser depilação', duration: 60, price: 180 },
  ],
  dentista: [
    { name: 'Consulta', duration: 60, price: 150 },
    { name: 'Limpeza dental', duration: 60, price: 120 },
    { name: 'Clareamento', duration: 90, price: 400 },
    { name: 'Extração', duration: 60, price: 200 },
    { name: 'Restauração', duration: 60, price: 180 },
  ],
  psicologo: [
    { name: 'Consulta individual', duration: 50, price: 180 },
    { name: 'Consulta de casal', duration: 60, price: 250 },
    { name: 'Avaliação psicológica', duration: 60, price: 200 },
  ],
  fisioterapeuta: [
    { name: 'Sessão de fisioterapia', duration: 60, price: 130 },
    { name: 'RPG', duration: 50, price: 150 },
    { name: 'Pilates terapêutico', duration: 50, price: 120 },
    { name: 'Acupuntura', duration: 60, price: 140 },
  ],
  nutricionista: [
    { name: 'Consulta nutricional', duration: 60, price: 150 },
    { name: 'Retorno', duration: 30, price: 80 },
    { name: 'Avaliação corporal', duration: 45, price: 100 },
  ],
  personal: [
    { name: 'Treino personalizado', duration: 60, price: 120 },
    { name: 'Avaliação física', duration: 60, price: 100 },
    { name: 'Aula de funcional', duration: 45, price: 90 },
  ],
  manicure: [
    { name: 'Manicure', duration: 45, price: 40 },
    { name: 'Pedicure', duration: 60, price: 50 },
    { name: 'Manicure + pedicure', duration: 90, price: 80 },
    { name: 'Gel nas unhas', duration: 90, price: 120 },
    { name: 'Nail art', duration: 60, price: 80 },
  ],
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function generateBusinessName(type: string): string {
  const firstName = pick(FIRST_NAMES)
  const lastName = pick(LAST_NAMES)

  switch (type) {
    case 'salao':    return `${pick(SALAO_NAMES)} da ${firstName}`
    case 'barbearia':return `${pick(BARBER_NAMES)} ${lastName}`
    case 'clinica':  return `${pick(CLINICA_NAMES)} ${lastName}`
    case 'dentista': return `${pick(DENTISTA_NAMES)} ${lastName}`
    case 'psicologo':return `${firstName} ${lastName} — ${pick(PSICO_NAMES)}`
    case 'fisioterapeuta': return `${pick(FISIO_NAMES)} ${lastName}`
    case 'nutricionista':  return `${pick(NUTRI_NAMES)} — ${firstName} ${lastName}`
    case 'personal': return `${firstName} ${lastName} ${pick(PERSONAL_NAMES)}`
    case 'manicure': return `${pick(MANICURE_NAMES)} da ${firstName}`
    default:         return `${firstName} ${lastName}`
  }
}

function generateSlug(businessName: string, index: number): string {
  const base = slugify(businessName)
  return `${base}-${index}`
}

function generateEmail(firstName: string, lastName: string, index: number): string {
  const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br']
  const name = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}`
  return `${name}@${pick(domains)}`
}

function generatePhone(): string {
  const ddd = pick(['11', '21', '31', '41', '51', '71', '85', '81', '92', '62'])
  const number = Math.floor(900000000 + Math.random() * 99999999)
  return `${ddd}9${number}`.slice(0, 11)
}

// Availability: Mon-Fri 09:00-18:00 or Mon-Sat 09:00-20:00
function generateAvailability(professionalId: string) {
  const extended = Math.random() > 0.5
  const days = extended ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5]
  const endTime = extended ? '20:00' : '18:00'

  return days.map((dayOfWeek) => ({
    professionalId,
    dayOfWeek,
    startTime: '09:00',
    endTime,
    active: true,
  }))
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database with 500+ businesses...')

  let created = 0
  const TARGET = 520

  for (let i = 0; i < TARGET; i++) {
    const { city, state } = pick(CITIES)
    const type = pick(BUSINESS_TYPES)
    const firstName = pick(FIRST_NAMES)
    const lastName = pick(LAST_NAMES)
    const businessName = generateBusinessName(type)
    const email = generateEmail(firstName, lastName, i)
    const slug = generateSlug(businessName, i)
    const isFeatured = Math.random() < 0.15 // 15% featured

    // Deduplicate: skip if email or slug already exists
    const exists = await prisma.professional.findFirst({
      where: { OR: [{ email }, { slug }] },
      select: { id: true },
    })
    if (exists) continue

    const professional = await prisma.professional.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        phone: generatePhone(),
        businessName,
        businessType: type,
        slug,
        city,
        state,
        address: `Rua ${pick(LAST_NAMES)}, ${Math.floor(Math.random() * 2000) + 1}`,
        plan: 'FREE',
        isFeatured,
      },
    })

    // Services
    const services = SERVICES_BY_TYPE[type] ?? []
    const servicesToCreate = services.slice(0, Math.floor(Math.random() * 3) + 2)
    for (const svc of servicesToCreate) {
      await prisma.service.create({
        data: {
          professionalId: professional.id,
          name: svc.name,
          duration: svc.duration,
          price: svc.price + (Math.floor(Math.random() * 5) * 10), // slight price variation
          active: true,
        },
      })
    }

    // Availability
    const availabilities = generateAvailability(professional.id)
    for (const avail of availabilities) {
      await prisma.availability.create({ data: avail })
    }

    created++
    if (created % 50 === 0) {
      console.log(`  ✓ ${created} businesses created...`)
    }
  }

  console.log(`\n✅ Done! Created ${created} businesses across ${CITIES.length} cities.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
