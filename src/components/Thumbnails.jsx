// Pure CSS/SVG thumbnails — no external images

export function SketchThumbnail() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#C8C4B8' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 120 90" preserveAspectRatio="none">
        <rect x="10" y="10" width="100" height="70" rx="3" stroke="#8A7E72" strokeWidth="1.2" fill="none" />
        <line x1="10" y1="45" x2="110" y2="43" stroke="#8A7E72" strokeWidth="1.2" strokeDasharray="3,4" />
        <line x1="15" y1="56" x2="95" y2="58" stroke="#8A7E72" strokeWidth="0.9" strokeDasharray="2,5" />
        <circle cx="25" cy="28" r="3" fill="#6B6459" opacity="0.6" />
        <circle cx="55" cy="22" r="2" fill="#6B6459" opacity="0.5" />
        <circle cx="90" cy="30" r="4" fill="#6B6459" opacity="0.4" />
        <circle cx="40" cy="68" r="2.5" fill="#6B6459" opacity="0.5" />
        <circle cx="75" cy="70" r="2" fill="#6B6459" opacity="0.6" />
      </svg>
    </div>
  )
}

export function CopyThumbnail() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0D0D24', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 12px', gap: 5 }}>
      {[100, 85, 90, 70, 95, 60].map((w, i) => (
        <div key={i} style={{
          height: 3, width: `${w}%`, borderRadius: 99,
          background: i === 0 ? '#5D85A8' : '#26323C',
          opacity: i === 0 ? 1 : 0.8,
        }} />
      ))}
    </div>
  )
}

export function PaletteThumbnail() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <div style={{ flex: 1, background: '#8B3A3A' }} />
      <div style={{ flex: 1, background: '#2D7D6E' }} />
      <div style={{ flex: 1, background: '#B8A44A' }} />
    </div>
  )
}

export function BrandingThumbnail() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#12121F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 80 80" width="55" height="55">
        <circle cx="40" cy="40" r="30" stroke="#636B74" strokeWidth="1.5" fill="none" />
        <path d="M40 15 L47 30 L62 32 L51 43 L54 58 L40 51 L26 58 L29 43 L18 32 L33 30 Z"
          stroke="#6060A0" strokeWidth="1.5" fill="none" />
        <circle cx="40" cy="40" r="5" fill="#636B74" />
      </svg>
    </div>
  )
}

export function NotesThumbnail() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#10102A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <div style={{ fontSize: 32, color: '#26323C', lineHeight: 1, fontFamily: 'serif' }}>❝</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '70%' }}>
        {[100, 80, 90].map((w, i) => (
          <div key={i} style={{ height: 2.5, width: `${w}%`, borderRadius: 99, background: '#26323C' }} />
        ))}
      </div>
    </div>
  )
}

export function ParchmentImage() {
  return (
    <div style={{ width: '100%', height: 160, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#C8A96E 0%,#A07840 30%,#7A5A28 60%,#4A3410 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%,rgba(255,220,140,0.3) 0%,transparent 60%), radial-gradient(ellipse at 70% 80%,rgba(60,30,0,0.4) 0%,transparent 50%)' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 200 160" preserveAspectRatio="xMidYMid slice">
        <rect x="8" y="8" width="184" height="144" rx="4" stroke="#7A5520" strokeWidth="1" fill="none" opacity="0.5" />
        <rect x="12" y="12" width="176" height="136" rx="3" stroke="#9A7040" strokeWidth="0.5" fill="none" opacity="0.4" />
        <path d="M8 20 Q8 8 20 8" stroke="#8A6030" strokeWidth="1.5" fill="none" />
        <path d="M192 20 Q192 8 180 8" stroke="#8A6030" strokeWidth="1.5" fill="none" />
        <path d="M8 140 Q8 152 20 152" stroke="#8A6030" strokeWidth="1.5" fill="none" />
        <path d="M192 140 Q192 152 180 152" stroke="#8A6030" strokeWidth="1.5" fill="none" />
        <text x="100" y="38" textAnchor="middle" fill="#3A2008" fontSize="8" fontStyle="italic" fontWeight="bold" opacity="0.85">The Obsidian Manifesto</text>
        <line x1="30" y1="44" x2="170" y2="44" stroke="#7A5520" strokeWidth="0.5" opacity="0.5" />
        {[54,63,72,81,90,99,108,117].map((y, i) => (
          <rect key={i} x={i%2===0?25:30} y={y} width={i%3===0?140:i%3===1?120:130} height={2} rx="1" fill="#5A3A10" opacity="0.35" />
        ))}
        <path d="M85 130 Q100 122 115 130 Q100 138 85 130" stroke="#7A5520" strokeWidth="1" fill="none" opacity="0.5" />
        <circle cx="100" cy="130" r="2" fill="#7A5520" opacity="0.4" />
      </svg>
    </div>
  )
}

// Custom image thumbnail — shown when the user has uploaded a cover image
export function CustomThumbnail({ src }) {
  return (
    <img
      src={src}
      alt="Cover"
      style={{
        width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center',
        display: 'block',
      }}
    />
  )
}

export function getThumbnail(type, coverImage) {
  // Custom image always takes priority
  if (coverImage) return <CustomThumbnail src={coverImage} />
  switch (type) {
    case 'sketch':   return <SketchThumbnail />
    case 'copy':     return <CopyThumbnail />
    case 'palette':  return <PaletteThumbnail />
    case 'branding': return <BrandingThumbnail />
    case 'notes':    return <NotesThumbnail />
    default:         return <div style={{ width: '100%', height: '100%', background: '#1B232B' }} />
  }
}
