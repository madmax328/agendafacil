import { createHmac } from 'crypto'

const SECRET = process.env.NEXTAUTH_SECRET ?? 'fallback-secret'

export function createCustomerToken(payload: { id: string; email: string; name: string }): string {
  const data = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyCustomerToken(token: string): { id: string; email: string; name: string } | null {
  try {
    const [data, sig] = token.split('.')
    const expected = createHmac('sha256', SECRET).update(data).digest('base64url')
    if (sig !== expected) return null
    return JSON.parse(Buffer.from(data, 'base64url').toString())
  } catch {
    return null
  }
}
