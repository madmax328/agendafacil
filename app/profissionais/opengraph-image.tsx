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
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '80px',
        }}
      >
        {/* Top label */}
        <div
          style={{
            background: 'rgba(255,255,255,0.2)',
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
          Encontre Profissionais
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
            color: 'rgba(255,255,255,0.95)',
            fontWeight: 600,
            textAlign: 'center',
            maxWidth: 760,
            lineHeight: 1.3,
            marginBottom: 20,
          }}
        >
          Salões, clínicas, dentistas e muito mais
        </div>

        {/* Sub message */}
        <div
          style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            maxWidth: 600,
            lineHeight: 1.4,
          }}
        >
          Agende online 24h, sem precisar ligar.
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 48,
            fontSize: 18,
            color: 'rgba(255,255,255,0.45)',
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
