const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || ''

import { generateLocalProvider } from './localGenerator'

// Flag to immediately use local generation if API is failing
const USE_LOCAL_GENERATION = true // Set to true to bypass API completely

const generateProvider = async () => {
  // Use local generation if flag is set
  if (USE_LOCAL_GENERATION) {
    return generateLocalProvider()
  }

  try {
    console.log('Attempting to fetch from OpenRouter...')
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://github.com/Guna42/her-connect',
        'X-Title': 'Her Connect'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Generate a realistic JSON object for a woman service provider with these fields:
          - name: Indian woman's full name
          - skills: array of 1-3 skills (tailor, beautician, mehendi artist, etc.)
          - location: Indian city name
          - experience: string like "4 years"
          - rating: number between 4.0-5.0
          - bio: 1-2 sentences about their work
          Don't include any other fields. Return only the JSON object, no other text.`
        }]
      })
    })

    if (!response.ok) {
      console.error('OpenRouter response not OK:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`API response not OK: ${response.status}`)
    }

    console.log('OpenRouter response received')
    const data = await response.json()
    console.log('Response data:', data)

    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected response format:', data)
      throw new Error('No content in response')
    }

    // The API returns the JSON object as a string inside the content
    const providerStr = data.choices[0].message.content.trim()
    console.log('Provider string:', providerStr)
    
    // Parse it into an object, handling cases where there might be markdown backticks
    const cleanJson = providerStr.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '')
    console.log('Cleaned JSON:', cleanJson)
    const provider = JSON.parse(cleanJson)

    // Add required id field
    provider.id = 'p_' + Date.now()
    provider.imageURL = '' // Required by UI

    return provider
  } catch (error) {
    console.error('Error generating provider:', error)
    console.log('Falling back to local generation...')
    return generateLocalProvider()
  }
}

// Extensive fallback sample data in case API fails
const sampleProviders = [
  {
    id: 'p1',
    name: 'Anita Rao',
    skills: ['Tailor', 'Embroidery'],
    location: 'Bengaluru',
    experience: '6 years',
    rating: 4.8,
    bio: 'Expert tailor specializing in custom bridal wear and traditional outfits.',
    imageURL: ''
  },
  {
    id: 'p2',
    name: 'Meera Kapoor',
    skills: ['Beautician', 'Makeup'],
    location: 'Mumbai',
    experience: '4 years',
    rating: 4.6,
    bio: 'Professional bridal and event makeup artist with expertise in HD makeup.',
    imageURL: ''
  },
  {
    id: 'p3',
    name: 'Priya Sharma',
    skills: ['Mehendi Artist'],
    location: 'Delhi',
    experience: '5 years',
    rating: 4.9,
    bio: 'Specializing in bridal mehendi and modern designs. Expert in Arabic and Indo-Western patterns.',
    imageURL: ''
  },
  {
    id: 'p4',
    name: 'Lakshmi Nair',
    skills: ['Tailor', 'Designer'],
    location: 'Chennai',
    experience: '8 years',
    rating: 4.9,
    bio: 'Fashion designer specializing in contemporary fusion wear and boutique clothing.',
    imageURL: ''
  },
  {
    id: 'p5',
    name: 'Zara Khan',
    skills: ['Beautician', 'Hair Stylist'],
    location: 'Hyderabad',
    experience: '7 years',
    rating: 4.7,
    bio: 'Expert hair stylist and beautician offering premium salon services at home.',
    imageURL: ''
  },
  {
    id: 'p6',
    name: 'Ritu Desai',
    skills: ['Jewellery Designer', 'Craftsperson'],
    location: 'Ahmedabad',
    experience: '5 years',
    rating: 4.8,
    bio: 'Handcrafted jewellery designer specializing in traditional and modern pieces.',
    imageURL: ''
  },
  {
    id: 'p7',
    name: 'Sarah Thomas',
    skills: ['Baker', 'Chef'],
    location: 'Kochi',
    experience: '4 years',
    rating: 4.7,
    bio: 'Artisan baker specializing in custom cakes and traditional Kerala snacks.',
    imageURL: ''
  },
  {
    id: 'p8',
    name: 'Jasmine Kaur',
    skills: ['Interior Designer'],
    location: 'Chandigarh',
    experience: '6 years',
    rating: 4.8,
    bio: 'Creative interior designer offering affordable home makeover services.',
    imageURL: ''
  }
]

const generateMultipleProviders = async (count = 5) => {
  try {
    const providers = []
    for (let i = 0; i < count; i++) {
      try {
        const provider = await generateProvider()
        providers.push(provider)
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.warn('Failed to generate provider, using fallback:', error)
        // Use a random sample provider as fallback
        const fallback = {...sampleProviders[Math.floor(Math.random() * sampleProviders.length)]}
        fallback.id = 'p_' + Date.now() + '_' + i // Ensure unique ID
        providers.push(fallback)
      }
    }
    return providers
  } catch (error) {
    console.error('Failed to generate providers, using all fallbacks:', error)
    // If everything fails, return all sample providers
    return sampleProviders.map((p, i) => ({
      ...p,
      id: 'p_' + Date.now() + '_' + i
    }))
  }
}

export { generateProvider, generateMultipleProviders }