import { ImageResponse } from 'next/og'

export const alt = 'Repo Universe - Every repository has a universe.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#030407', color: '#f5f7fa', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 74% 48%, #1b355055, transparent 38%)' }} />
      {[0, 1, 2].map((index) => (
        <div key={index} style={{ position: 'absolute', width: 250 + index * 145, height: 125 + index * 72, border: '1px solid #9bcff126', borderRadius: '50%', right: 45 - index * 70, top: 250 - index * 35, transform: `rotate(${index * 10 - 10}deg)` }} />
      ))}
      <div style={{ position: 'absolute', width: 142, height: 142, borderRadius: '50%', right: 225, top: 240, background: 'radial-gradient(circle at 34% 28%, #fff, #ffcf78 18%, #f48536 48%, transparent 72%)', boxShadow: '0 0 80px #ff9e4755' }} />
      <div style={{ position: 'absolute', width: 38, height: 38, borderRadius: '50%', right: 88, top: 205, background: '#3178c6', boxShadow: '0 0 28px #3178c666' }} />
      <div style={{ position: 'absolute', width: 27, height: 27, borderRadius: '50%', right: 410, top: 436, background: '#dea584', boxShadow: '0 0 22px #dea58455' }} />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 680, marginLeft: 70, zIndex: 2 }}>
        <div style={{ display: 'flex', color: '#8aa0b5', fontSize: 20, letterSpacing: 4, marginBottom: 25 }}>REPO UNIVERSE</div>
        <div style={{ display: 'flex', fontSize: 72, lineHeight: .98, fontWeight: 700, letterSpacing: -4 }}>Every repository has a universe.</div>
        <div style={{ display: 'flex', marginTop: 28, color: '#aab7c5', fontSize: 24 }}>Turn public GitHub repositories into explorable 3D solar systems.</div>
      </div>
    </div>,
    size,
  )
}
