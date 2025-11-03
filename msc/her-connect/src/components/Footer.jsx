import React from 'react'

export default function Footer(){
  return (
    <footer className="mt-8" style={{background: '#fff8f0', borderTop: '1px solid #dfa7a1'}}>
      <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm" style={{color: '#314456'}}>
        © {new Date().getFullYear()} Her Connect — Empowering women to connect, collaborate, and create securely.
      </div>
    </footer>
  )
}
