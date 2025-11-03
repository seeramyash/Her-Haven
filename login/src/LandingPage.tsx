import React, { useEffect } from 'react'

const iframeStyle: React.CSSProperties = {
  width: '100%',
  height: '100vh',
  border: '0',
}

// Provide a published Framer share URL via VITE_FRAMER_EMBED_URL
const FRAMER_URL = (import.meta as any).env?.VITE_FRAMER_EMBED_URL || ''

export default function LandingPage({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    // optionally scroll to top when landing shows
    window.scrollTo(0, 0)
  }, [])

  if (!FRAMER_URL) {
    return (
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:'2rem',textAlign:'center'}}>
        <h1>Her Haven</h1>
        <p>Set VITE_FRAMER_EMBED_URL in login/.env to show your Framer landing page.</p>
        <button onClick={onContinue} style={{marginTop:'1rem'}}>Continue to login</button>
      </div>
    )
  }

  return (
    <div style={{position:'relative'}}>
      <iframe title="Her Haven" src={FRAMER_URL} style={iframeStyle} allow="fullscreen; clipboard-write;" />
      <button onClick={onContinue} style={{position:'fixed',right:16,bottom:16,padding:'0.75rem 1rem',borderRadius:8,background:'#111827',color:'#fff',border:'none',cursor:'pointer'}}>
        Continue to login
      </button>
    </div>
  )
}
