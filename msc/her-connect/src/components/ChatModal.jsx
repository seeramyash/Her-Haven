import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function ChatModal({provider, onClose, demoMode=false}){
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const boxRef = useRef()

  useEffect(()=>{
    // on open, load messages from localStorage (UI-only)
    const key = `chat_${provider?.id}`
    const saved = localStorage.getItem(key)
    if(saved) setMessages(JSON.parse(saved))
  }, [provider])

  useEffect(()=>{
    boxRef.current?.scrollTo({top: boxRef.current.scrollHeight, behavior:'smooth'})
  }, [messages])

  const send = (e) =>{
    e.preventDefault()
    if(!text.trim()) return
    const msg = { id: Date.now(), sender: 'You', text: text.trim(), ts: new Date().toISOString() }
    const next = [...messages, msg]
    setMessages(next)
    localStorage.setItem(`chat_${provider.id}`, JSON.stringify(next))
    setText('')
  }

  if(!provider) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <motion.div
        initial={{y:200, opacity:0}}
        animate={{y:0, opacity:1}}
        className={`${demoMode ? 'w-full h-full sm:w-3/4 sm:h-3/4' : 'w-full sm:w-96'} bg-white rounded-t-lg sm:rounded-lg shadow-lg overflow-hidden z-50 flex flex-col`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold">Chat with {provider.name}</div>
            <div className="text-xs text-gray-500">{provider.skills.join(', ')} • {provider.location}</div>
          </div>
          <div className="flex gap-2">
            {demoMode && <div className="text-xs text-gray-500 mr-2">Demo chat mode</div>}
            <button onClick={onClose} className="text-gray-500">Close</button>
          </div>
        </div>
        <div ref={boxRef} style={{height: demoMode ? 'calc(100% - 140px)' : 300}} className="p-3 overflow-y-auto bg-ivory flex-1">
          {messages.length===0 && <div className="text-center text-sm text-gray-500 mt-8">No messages yet. Say hi 👋</div>}
          {messages.map(m=> (
            <div key={m.id} className={`mb-2 ${m.sender==='You' ? 'text-right' : 'text-left'}`}>
              <div className={`${m.sender==='You' ? 'inline-block text-white' : 'inline-block bg-white border'} px-3 py-2 rounded-lg`} style={m.sender==='You' ? {background: 'linear-gradient(135deg, #dfa7a1 0%, #f9d5d1 100%)'} : {}}>{m.text}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(m.ts).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="p-3 border-t flex gap-2">
          <input className="flex-1 p-2 border rounded" value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..." />
          <button className="px-3 py-2 text-white rounded transition-colors hover:opacity-90" style={{background: 'linear-gradient(135deg, #dfa7a1 0%, #f9d5d1 100%)'}}>Send</button>
        </form>
      </motion.div>
    </div>
  )
}
