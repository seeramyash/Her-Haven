import React, { useState, useEffect } from 'react'
import ProviderCard from './ProviderCard'

export default function FindService({providers, onSearch, onChat, onPay, demoHost}){
  const [serviceType, setServiceType] = useState('')
  const [location, setLocation] = useState('')

  // NOTE: don't auto-trigger search here; App provides initial filtered providers synchronously

  // Example services for the placeholder
  const serviceSuggestion = 'Try: Tailor, Beautician, Cook, Mehendi'

  const handleSearch = (e) =>{
    e.preventDefault()
    onSearch({serviceType: serviceType.trim(), location: location.trim()})
  }

  // Live search when user types (keeps UI snappy)
  useEffect(() => {
    // only trigger if user typed something; otherwise leave results as-is
    if(serviceType.trim() === '' && location.trim() === '') return
    onSearch({serviceType: serviceType.trim(), location: location.trim()})
  }, [serviceType, location])

  const showAll = () => {
    setServiceType('')
    setLocation('')
    onSearch({serviceType: '', location: ''})
  }

  return (
    <section id="find" className="">
      <h3 className="text-xl font-semibold mb-3">Find a Service</h3>
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-sm mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <input 
              placeholder={serviceSuggestion}
              value={serviceType} 
              onChange={e=>setServiceType(e.target.value)} 
              className="p-2 border rounded w-full" 
            />
            <div className="text-xs text-gray-500 mt-1">Enter a service type</div>
          </div>
          <div>
            <input 
              placeholder="City (e.g., Visakhapatnam)" 
              value={location} 
              onChange={e=>setLocation(e.target.value)} 
              className="p-2 border rounded w-full" 
            />
            <div className="text-xs text-gray-500 mt-1">Enter city name</div>
          </div>
          <div className="flex items-center">
            <button type="submit" className="px-4 py-2 text-white rounded transition-colors hover:opacity-90" style={{background: 'linear-gradient(135deg, #dfa7a1 0%, #f9d5d1 100%)'}}>
              Search
            </button>
          </div>
        </div>
      </form>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-gray-600">Showing {providers?.length || 0} provider(s)</div>
        <div>
          <button onClick={showAll} className="text-sm underline transition-colors hover:opacity-80" style={{color: '#dfa7a1'}}>Show all</button>
        </div>
      </div>

      <div className="space-y-3">
        {providers && providers.length>0 ? (
          providers.map((p, idx) => (
            <div key={p.id}>
              <ProviderCard provider={p} onChat={onChat} onPay={onPay} />
              {/* If this is the first item in results, show a demo-sharing link */}

            </div>
          ))
        ) : (
          <div className="text-gray-500">No providers found.</div>
        )}
      </div>
    </section>
  )
}
