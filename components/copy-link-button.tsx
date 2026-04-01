'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select the text
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="shrink-0 border-blue-200 text-blue-700 hover:bg-blue-100 gap-1"
      onClick={handleCopy}
    >
      {copied ? (
        <><Check className="h-3.5 w-3.5" /><span className="hidden sm:inline">Copiado!</span></>
      ) : (
        <><Copy className="h-3.5 w-3.5" /><span className="hidden sm:inline">Copiar</span></>
      )}
    </Button>
  )
}
