import React from 'react'

const CHAT_URL = import.meta.env.VITE_CHAT_URL || 'https://chat-les0.onrender.com/'

export default function ProviderCard({provider, onChat, onPay}){
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold" style={{background: 'linear-gradient(135deg, #dfa7a1 0%, #f9d5d1 100%)'}}>{provider.name?.[0]}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{provider.name}</div>
              <div className="text-sm text-gray-500">{provider.skills.join(' • ')} • {provider.experience}</div>
            </div>
            <div className="text-sm font-semibold" style={{color: '#dfa7a1'}}>{provider.rating} ★</div>
          </div>
          <p className="mt-2 text-sm text-gray-600">{provider.bio}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-500">{provider.location}</div>
            <div className="flex gap-2">
              <a 
                href={CHAT_URL}
                target="_self"
                className="px-3 py-1 rounded text-sm transition-colors hover:opacity-90"
                style={{background: 'linear-gradient(135deg, #f9d5d1 0%, #dfa7a1 100%)', color: 'white'}}
              >
                Chat
              </a>
              <button onClick={()=>onPay(provider)} className="px-3 py-1 rounded text-white text-sm transition-colors hover:opacity-90" style={{background: 'linear-gradient(135deg, #dfa7a1 0%, #f9d5d1 100%)'}}>Pay</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
