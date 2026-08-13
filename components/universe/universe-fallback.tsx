import type { CSSProperties } from 'react'
import type { RepositoryUniverseData, UniverseModel } from '@/lib/universe/types'

export function UniverseFallback({ data, model }: { data: RepositoryUniverseData; model: UniverseModel }) {
  return (
    <div className="universe-fallback" role="img" aria-label={`2D map of ${data.repository.fullName}`}>
      <div className="fallback-grid" aria-hidden="true" />
      {model.planets.map((planet, index) => {
        const diameter = Math.min(82, 26 + planet.percentage * 0.7)
        const orbit = Math.min(82, 26 + index * 8.5)
        const angle = planet.startAngle
        const x = 50 + Math.cos(angle) * orbit * 0.42
        const y = 50 + Math.sin(angle) * orbit * 0.34
        return (
          <div
            key={planet.id}
            className="fallback-planet"
            style={{
              width: diameter,
              height: diameter,
              left: `${x}%`,
              top: `${y}%`,
              background: `radial-gradient(circle at 32% 28%, #fff8, ${planet.color} 36%, #091019 80%)`,
            }}
            title={`${planet.language} ${planet.percentage.toFixed(1)}%`}
          />
        )
      })}
      <div className="fallback-star" style={{ '--fallback-accent': model.star.color } as CSSProperties} />
      <div className="fallback-message">
        <span>2D FALLBACK</span>
        <strong>{data.repository.fullName}</strong>
        <p>WebGL is unavailable or the graphics context was lost. Repository data remains accessible in the inspector.</p>
      </div>
    </div>
  )
}
