import { ImageResponse } from 'next/og'
import { getRepositoryUniverseData } from '@/lib/github/client'
import { createUniverseModel } from '@/lib/universe/model'

export const alt = 'Repo Universe repository visualization preview'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage({ params }: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner, repo } = await params
  try {
    const data = await getRepositoryUniverseData(owner, repo)
    const model = createUniverseModel(data)
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#030407', color: '#f7f8fb', fontFamily: 'sans-serif' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 68% 44%, #20324f55 0, #030407 48%)' }} />
        {[0, 1, 2].map((index) => (
          <div key={index} style={{ position: 'absolute', width: 240 + index * 135, height: 120 + index * 68, border: '1px solid #9ab4d326', borderRadius: '50%', left: 725 - (240 + index * 135) / 2, top: 300 - (120 + index * 68) / 2, transform: `rotate(${index * 12 - 8}deg)` }} />
        ))}
        <div style={{ position: 'absolute', width: 128, height: 128, borderRadius: '50%', left: 661, top: 236, background: `radial-gradient(circle at 35% 30%, #fff, #ffb24d 28%, ${model.star.color} 58%, #0000 72%)`, boxShadow: '0 0 70px 20px #ff9f3d55' }} />
        {model.planets.slice(0, 5).map((planet, index) => {
          const angle = planet.startAngle + index * 0.35
          const radius = 150 + index * 48
          return <div key={planet.id} style={{ position: 'absolute', width: 26 + planet.percentage * 0.25, height: 26 + planet.percentage * 0.25, borderRadius: '50%', left: 725 + Math.cos(angle) * radius, top: 300 + Math.sin(angle) * radius * 0.48, background: planet.color, boxShadow: `0 0 22px ${planet.color}66` }} />
        })}
        <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'center', marginLeft: 70, width: 500, zIndex: 2 }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 3, color: '#9ba8b8', marginBottom: 24 }}>REPO UNIVERSE</div>
          <div style={{ display: 'flex', fontSize: 56, lineHeight: 1.04, fontWeight: 700, letterSpacing: -2 }}>{data.repository.fullName}</div>
          <div style={{ display: 'flex', marginTop: 20, fontSize: 24, color: '#c3cad4' }}>★ {data.repository.stars.toLocaleString()} &nbsp; / &nbsp; {data.repository.forks.toLocaleString()} forks</div>
          <div style={{ display: 'flex', marginTop: 42, fontSize: 18, color: '#7f8a98' }}>Every repository has a universe.</div>
        </div>
      </div>,
      size,
    )
  } catch {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#030407', color: '#f5f7fa', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 58, fontWeight: 700 }}>Repo Universe</div>
        <div style={{ marginTop: 20, fontSize: 26, color: '#9aa6b6' }}>Every repository has a universe.</div>
      </div>,
      size,
    )
  }
}
