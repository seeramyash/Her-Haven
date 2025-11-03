import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Hero from './components/Hero'
import FindService from './components/FindService'
import OfferService from './components/OfferService'
import Footer from './components/Footer'
import ChatModal from './components/ChatModal'
import PaymentModal from './components/PaymentModal'
import Navbar from './components/Navbar'
import { generateLocalProvider, generateProvidersForCities } from './services/localGenerator'

export default function App(){
  // Initialize providers synchronously so data exists, but don't show any until user searches
  const initialProviders = generateProvidersForCities(undefined, 3) // 3 providers per service type per city
  const [providers, setProviders] = useState(initialProviders)
  const [filteredProviders, setFilteredProviders] = useState([]) // empty until search
  const [activeSection, setActiveSection] = useState('find') // 'find' | 'offer'
  const [isLoading, setIsLoading] = useState(false)

  const [error, setError] = useState(null)
  const [demoOnly, setDemoOnly] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [activeProvider, setActiveProvider] = useState(null)

  // Fixed demo host (use your machine IP and the port Vite prints when running with --host)
  // Change this value if your dev server uses a different IP/port
  const DEMO_HOST = '10.1.167.67:5175'

  const handleSearch = (filters) => {
    // If no filters, show all providers
    if (!filters.serviceType && !filters.location) {
      setFilteredProviders(providers)
      return
    }

    let results = providers.filter(p => {
      // More flexible service type matching
      const matchesService = !filters.serviceType || 
        p.skills.some(skill => 
          skill.toLowerCase().includes(filters.serviceType.toLowerCase()) ||
          filters.serviceType.toLowerCase().includes(skill.toLowerCase())
        )
      
      // More flexible location matching
      const matchesLocation = !filters.location || 
        p.location.toLowerCase().includes(filters.location.toLowerCase())
      
      return matchesService && matchesLocation
    })
    
    // Sort by rating desc
    results = results.sort((a,b)=> b.rating - a.rating)
    setFilteredProviders(results)
  }

  // If a chat query param is present, auto-open chat for that provider id
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const chatId = params.get('chat') || params.get('demo_chat')
    const demo = params.has('demo_chat')
    if (chatId) {
      const found = providers.find(p => p.id === chatId)
      if (found) {
        setActiveProvider(found)
        setChatOpen(true)
        if (demo) setDemoOnly(true)
      }
    }
  }, [providers])

  const openChat = (provider) => {
    // Redirect to our chat room with provider info
    const chatUrl = `http://localhost:4000?name=${encodeURIComponent(provider.name)}&room=${encodeURIComponent(provider.id)}`
    window.open(chatUrl, '_blank')
  }

  const openPayment = (provider) => {
    setActiveProvider(provider)
    setPaymentOpen(true)
  }

  const addProvider = (formData) => {
    try {
      const newP = {
        id: 'p_' + Date.now(),
        name: formData.name,
        skills: formData.skills?.split(',').map(s => s.trim()),
        location: formData.location,
        experience: formData.experience,
        bio: formData.bio,
        rating: 5.0, // New providers start with 5.0
        imageURL: ''
      }
      setProviders(prev => [newP, ...prev])
      setFilteredProviders(prev => [newP, ...prev])
      return true
    } catch (error) {
      console.error('Error adding provider:', error)
      return false
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {!demoOnly && (
        <header className="sticky top-0 z-30 bg-ivory/90 backdrop-blur-sm border-b border-peach/30">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold" style={{color: '#dfa7a1'}}>Her Connect</h1>
              <p className="text-sm text-gray-500">Empowering women to connect, collaborate, and create securely</p>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}}>
          <Hero setActiveSection={setActiveSection} />
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Only show one section at a time */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-4" style={{borderColor: '#dfa7a1', borderTopColor: 'transparent'}}></div>
                <p className="text-gray-600">Loading providers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="mb-2" style={{color: '#dfa7a1'}}>{error}</p>
                {providers.length > 0 && (
                  <p className="text-sm text-gray-500">Showing available providers below.</p>
                )}
              </div>
            ) : activeSection === 'find' ? (
                  <FindService providers={filteredProviders} onSearch={handleSearch} onChat={openChat} onPay={openPayment} demoHost={DEMO_HOST} />
            ) : (
              <OfferService onAddProvider={addProvider} />
            )}
          </div>
        </motion.div>
      </main>

      {!demoOnly && <Footer />}

      {chatOpen && (
        <ChatModal
          provider={activeProvider}
          demoMode={demoOnly}
          onClose={() => {
            setChatOpen(false)
            setDemoOnly(false)
            const url = new URL(window.location.href)
            url.searchParams.delete('demo_chat')
            url.searchParams.delete('chat')
            window.history.replaceState({}, '', url.toString())
          }}
        />
      )}
      {paymentOpen && <PaymentModal provider={activeProvider} onClose={()=>setPaymentOpen(false)} />}
    </div>
  )
}
