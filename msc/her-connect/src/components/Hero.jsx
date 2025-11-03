import React from 'react'
import { motion } from 'framer-motion'

export default function Hero({ setActiveSection }){
  return (
    <section className="py-12" style={{background: 'linear-gradient(135deg, rgba(249, 213, 209, 0.3) 0%, rgba(223, 167, 161, 0.2) 100%)'}}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-8">
        <motion.div className="flex-1" initial={{x:-40, opacity:0}} animate={{x:0, opacity:1}} transition={{duration:0.6}}>
          <h2 className="text-4xl font-extrabold mb-4" style={{color: '#dfa7a1'}}>Her Connect</h2>
          <p className="text-lg mb-6" style={{color: '#314456'}}>Find trusted women-led services near you or offer your craft. Chat, collaborate, and get paid securely.</p>
          <div className="flex gap-3">
            <button onClick={()=>setActiveSection && setActiveSection('find')} className="px-5 py-3 text-white rounded-md transition-colors hover:opacity-90" style={{background: 'linear-gradient(135deg, #dfa7a1 0%, #f9d5d1 100%)'}}>Find a Service</button>
            <button onClick={()=>setActiveSection && setActiveSection('offer')} className="px-5 py-3 rounded-md transition-colors" style={{background: 'white', border: '1px solid #dfa7a1', color: '#dfa7a1'}}>Offer your services</button>
          </div>
        </motion.div>
        <motion.div className="flex-1 p-6 rounded-lg shadow-md" style={{background: '#fff8f0'}} initial={{x:40, opacity:0}} animate={{x:0, opacity:1}} transition={{duration:0.6}}>
          <div className="text-center text-sm" style={{color: '#314456'}}>Featured Provider</div>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-white" style={{background: 'linear-gradient(135deg, #dfa7a1 0%, #f9d5d1 100%)'}}>A</div>
            <div>
              <div className="font-semibold" style={{color: '#314456'}}>Anita Rao</div>
              <div className="text-sm" style={{color: '#dfa7a1'}}>Tailor • 6 yrs exp • Bengaluru</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
