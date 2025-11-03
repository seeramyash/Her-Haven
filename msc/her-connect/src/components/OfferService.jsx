import React, { useState } from 'react'

export default function OfferService({onAddProvider}){
  const [name, setName] = useState('')
  const [experience, setExperience] = useState('')
  const [skills, setSkills] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [files, setFiles] = useState([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')

  const handleSubmit = async (e) =>{
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('Generating provider profile...')
    
    try {
      const formData = { name, experience, skills, location, bio }
      const success = await onAddProvider(formData)
      
      if(success) {
        setSubmitStatus('Provider added successfully!')
        // reset form
        setName('')
        setExperience('')
        setSkills('')
        setLocation('')
        setBio('')
        setFiles([])
        
        // Clear success message after 3 seconds
        setTimeout(() => setSubmitStatus(''), 3000)
      } else {
        setSubmitStatus('Failed to add provider. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="offer">
      <h3 className="text-xl font-semibold mb-3">Offer Your Services</h3>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 gap-3">
          <input required placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="p-2 border rounded" />
          <input placeholder="Experience (e.g., 5 years)" value={experience} onChange={e=>setExperience(e.target.value)} className="p-2 border rounded" />
          <input placeholder="Skills (comma separated)" value={skills} onChange={e=>setSkills(e.target.value)} className="p-2 border rounded" />
          <input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} className="p-2 border rounded" />
          <textarea placeholder="Short bio / description" value={bio} onChange={e=>setBio(e.target.value)} className="p-2 border rounded" />
          <label className="text-sm text-gray-500">Upload work samples (UI-only)</label>
          <input type="file" multiple onChange={e=>setFiles(e.target.files)} />
          <div className="pt-2 space-y-2">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
              style={{background: 'linear-gradient(135deg, #dfa7a1 0%, #f9d5d1 100%)'}}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            {submitStatus && (
              <div className={`text-sm ${submitStatus.includes('success') ? 'text-green-600' : ''}`} style={{color: submitStatus.includes('success') ? '#10b981' : '#dfa7a1'}}>
                {submitStatus}
              </div>
            )}
          </div>
        </div>
      </form>
    </section>
  )
}
