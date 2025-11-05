import React, { useMemo, useState } from 'react'
import LandingPage from './LandingPage'
import App from './App'

export default function Root() {
  // Read env flags to decide whether to show landing or go straight to login
  const FRAMER_URL = (import.meta as any).env?.VITE_FRAMER_EMBED_URL as string | undefined
  const SKIP_LANDING = ((import.meta as any).env?.VITE_SKIP_LANDING ?? '').toString() === '1'

  const [showLogin, setShowLogin] = useState<boolean>(() => {
    // If no framer URL configured or skip flag set, go straight to login
    if (SKIP_LANDING || !FRAMER_URL) return true
    // Otherwise, show landing once per session
    return sessionStorage.getItem('visitedLanding') === '1'
  })

  const onContinue = useMemo(() => () => {
    sessionStorage.setItem('visitedLanding', '1')
    setShowLogin(true)
  }, [])

  if (showLogin) return <App />
  return <LandingPage onContinue={onContinue} />
}
