import React, { useMemo, useState } from 'react'
import LandingPage from './LandingPage'
import App from './App'

export default function Root() {
  const [showLogin, setShowLogin] = useState<boolean>(() => {
    // if already visited once in this browser session, skip landing
    return sessionStorage.getItem('visitedLanding') === '1'
  })

  const onContinue = useMemo(() => () => {
    sessionStorage.setItem('visitedLanding', '1')
    setShowLogin(true)
  }, [])

  if (showLogin) return <App />
  return <LandingPage onContinue={onContinue} />
}
