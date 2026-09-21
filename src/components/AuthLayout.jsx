// Decorative relic cards used on the auth left panel – pure CSS/SVG
function DecorativeRelics() {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 32, width: '100%', maxWidth: 420 }}>
      {/* Card 1 – Sketch, dimmed */}
      <div style={{
        flex: 1, borderRadius: 12, padding: 10, opacity: 0.55,
        background: '#1A1A35', border: '1px solid #2A2A48',
      }}>
        <div style={{ height: 72, borderRadius: 8, background: '#C8C4B8', marginBottom: 8, position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="0 0 120 72" preserveAspectRatio="none">
            <rect x="10" y="10" width="100" height="52" rx="3" stroke="#8A7E72" strokeWidth="1" fill="none" />
            <line x1="10" y1="36" x2="110" y2="34" stroke="#8A7E72" strokeWidth="1" strokeDasharray="3,4" />
          </svg>
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#7B6FFF', marginBottom: 4 }}>SKETCH</div>
        <div style={{ fontSize: 10, fontStyle: 'italic', fontWeight: 700, color: '#C8C8E0' }}>"Complex hero"</div>
      </div>

      {/* Card 2 – Copywriting, SELECTED / revived */}
      <div style={{
        flex: 1, borderRadius: 12, padding: 10,
        background: '#1A1A35',
        border: '1.5px solid #5B4BFF',
        boxShadow: '0 0 0 3px rgba(91,75,255,0.18)',
      }}>
        <div style={{ height: 72, borderRadius: 8, background: '#0D0D24', marginBottom: 8, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              background: '#5B4BFF', borderRadius: 5, padding: '2px 7px',
              fontSize: 7, fontWeight: 700, letterSpacing: '0.08em', color: 'white',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              ↩ REVIVED
            </div>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 10px', gap: 3 }}>
            {[100, 85, 90, 70].map((w, i) => (
              <div key={i} style={{ height: 2.5, width: `${w}%`, borderRadius: 99, background: i === 0 ? '#5B4BFF' : '#2A2A55', opacity: 0.8 }} />
            ))}
          </div>
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#7B6FFF', marginBottom: 4 }}>COPYWRITING</div>
        <div style={{ fontSize: 10, fontStyle: 'italic', fontWeight: 700, color: '#E8E8F0' }}>"The Obsidian…"</div>
      </div>

      {/* Card 3 – Palette, dimmed */}
      <div style={{
        flex: 1, borderRadius: 12, padding: 10, opacity: 0.55,
        background: '#1A1A35', border: '1px solid #2A2A48',
      }}>
        <div style={{ height: 72, borderRadius: 8, overflow: 'hidden', marginBottom: 8, display: 'flex' }}>
          <div style={{ flex: 1, background: '#8B3A3A' }} />
          <div style={{ flex: 1, background: '#2D7D6E' }} />
          <div style={{ flex: 1, background: '#B8A44A' }} />
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#7B6FFF', marginBottom: 4 }}>PALETTE</div>
        <div style={{ fontSize: 10, fontStyle: 'italic', fontWeight: 700, color: '#C8C8E0' }}>"Neon Summer"</div>
      </div>
    </div>
  )
}

export default function AuthLayout({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A1E', overflow: 'hidden' }}>

      {/* ── macOS chrome ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 36,
        background: '#0A0A1E', borderBottom: '1px solid #1E1E3A',
        display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px',
        zIndex: 10,
      }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
      </div>

      {/* ── Left brand panel ── */}
      <div style={{
        width: '55%',
        background: '#14142B',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px 60px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Violet glow */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '10%',
          width: '70%', height: '60%',
          background: 'radial-gradient(ellipse at center, rgba(91,75,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{
            width: 36, height: 36, background: '#5B4BFF', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 20 20" width="22" height="22" fill="none">
              <rect x="3" y="3" width="6" height="6" rx="1.5" fill="white" opacity="0.9" />
              <rect x="11" y="3" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
              <rect x="3" y="11" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
              <rect x="11" y="11" width="6" height="6" rx="1.5" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#E8E8F0', letterSpacing: '-0.02em' }}>
            Archivo Muerto
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 38, fontWeight: 800, color: '#E8E8F0',
          lineHeight: 1.15, letterSpacing: '-0.03em',
          marginBottom: 16, maxWidth: 420,
        }}>
          Where discarded ideas come back to life.
        </h1>
        <p style={{ fontSize: 14, color: '#7E7EA0', lineHeight: 1.7, maxWidth: 380, marginBottom: 0 }}>
          A museum for the drafts, palettes and sketches your team left behind.
        </p>

        <DecorativeRelics />
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        width: '45%',
        background: '#0F0F22',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 32px 40px',
        borderLeft: '1px solid #1E1E3A',
        overflowY: 'auto',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          background: '#141428',
          border: '1px solid #2A2A48',
          borderRadius: 14,
          padding: '32px 28px',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
