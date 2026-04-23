'use client'

export function BookButton({ serviceId, isDemo }: { serviceId: string; isDemo: boolean }) {
  function handleClick() {
    window.dispatchEvent(new CustomEvent('open-booking', { detail: serviceId }))
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDemo}
      className="shrink-0 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      Agendar
    </button>
  )
}

export function BookButtonCard({ serviceId, isDemo }: { serviceId: string; isDemo: boolean }) {
  function handleClick() {
    window.dispatchEvent(new CustomEvent('open-booking', { detail: serviceId }))
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDemo}
      className="mt-auto w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      Agendar
    </button>
  )
}
