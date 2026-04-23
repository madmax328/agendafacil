import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 60%, #374151 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '80px',
        }}
      >
        {/* Top label */}
        <div
          style={{
            background: '#2563eb',
            color: 'white',
            fontSize: 18,
            fontWeight: 700,
            padding: '8px 20px',
            borderRadius: 24,
            marginBottom: 32,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          Para Profissionais
        </div>

        {/* Brand */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-2px',
            marginBottom: 24,
          }}
        >
          Markou
        </div>

        {/* Main message */}
        <div
          style={{
            fontSize: 34,
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            textAlign: 'center',
            maxWidth: 760,
            lineHeight: 1.3,
            marginBottom: 20,
          }}
        >
          Sua agenda online em 10 minutos
        </div>

        {/* Sub message */}
        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            maxWidth: 600,
            lineHeight: 1.4,
          }}
        >
          Clientes agendam sozinhos, 24h por dia. Adeus no-show.
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 48,
            fontSize: 18,
            color: 'rgba(255,255,255,0.35)',
            fontWeight: 500,
          }}
        >
          www.markou.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
