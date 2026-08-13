'use client'

import { useEffect, useRef, useState } from 'react'
import type { GraphicsQuality, UniverseModel } from '@/lib/universe/types'
import type { UniverseEngine, UniverseHover } from './engine/UniverseEngine'

export type UniverseCanvasApi = {
  focus: (id: string) => void
  reset: () => void
  setPaused: (paused: boolean) => void
}

export function UniverseCanvas({
  model,
  quality,
  reducedMotion,
  onHover,
  onSelect,
  onReady,
  onUnavailable,
}: {
  model: UniverseModel
  quality: GraphicsQuality
  reducedMotion: boolean
  onHover: (hover: UniverseHover) => void
  onSelect: (id: string) => void
  onReady: (api: UniverseCanvasApi | null) => void
  onUnavailable: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let engine: UniverseEngine | null = null
    let cancelled = false

    async function mount() {
      const container = ref.current
      if (!container) return
      try {
        const probe = document.createElement('canvas')
        const probeContext = probe.getContext('webgl2') || probe.getContext('webgl')
        if (!probeContext) throw new Error('WebGL unavailable')
        probeContext.getExtension('WEBGL_lose_context')?.loseContext()
        const engineModule = await import('./engine/UniverseEngine')
        if (cancelled) return
        engine = new engineModule.UniverseEngine(container, model, {
          quality,
          reducedMotion,
          onHover,
          onSelect,
          onContextLost: onUnavailable,
        })
        onReady({
          focus: (id) => engine?.focus(id),
          reset: () => engine?.reset(),
          setPaused: (paused) => engine?.setPaused(paused),
        })
        setLoading(false)
      } catch {
        setLoading(false)
        onUnavailable()
      }
    }

    void mount()
    return () => {
      cancelled = true
      onReady(null)
      engine?.dispose()
    }
  }, [model, onHover, onReady, onSelect, onUnavailable, quality, reducedMotion])

  return (
    <div ref={ref} className="universe-canvas-host">
      {loading && <div className="scene-loading">Constructing universe…</div>}
    </div>
  )
}
