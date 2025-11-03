// Local data generation fallback
const firstNames = [
  'Lakshmi', 'Padma', 'Anitha', 'Durga', 'Sita', 'Priya', 'Madhavi', 'Vani',
  'Divya', 'Swathi', 'Deepika', 'Kavya', 'Bhavani', 'Suma', 'Lalitha', 'Rani'
]

const lastNames = [
  'Reddy', 'Naidu', 'Raju', 'Krishna', 'Rao', 'Devi', 'Chowdary', 'Varma',
  'Achari', 'Murthy', 'Sastry', 'Kumar', 'Prasad', 'Patnaik', 'Chari', 'Sharma'
]

// Focused cities as requested
const cities = [
  'Ongole', 'Guntur', 'Vijayawada', 'Kakinada', 'Kadapa', 'Tirupati', 'Rajahmundry'
]

const skills = {
  'Tailor': ['Traditional Telugu style blouses', 'Pattu saree alterations', 'Designer blouses', 'Lehenga work', 'Kids wear'],
  'Beautician': ['Bridal makeup', 'Traditional Telugu bride makeup', 'Threading', 'Facial treatments', 'Hair styling'],
  'Mehendi Artist': ['Telugu bridal mehendi', 'Andhra traditional designs', 'Modern patterns', 'Natural henna application'],
  'Traditional Cook': ['Andhra meals', 'Telugu wedding catering', 'Festival sweets', 'Pickle making', 'Traditional snacks'],
  'Saree Designer': ['Pattu saree work', 'Maggam work', 'Zari work', 'Designer borders', 'Blouse design'],
  'Jewellery Maker': ['Temple jewellery', 'Traditional Telugu designs', 'Pearl work', 'Bridal sets', 'Custom orders'],
  'Event Decorator': ['Telugu wedding decoration', 'Pellikuturu function setup', 'Half saree function decor', 'Home decoration'],
  'Makeup Artist': ['Telugu bride makeup', 'Half saree function makeup', 'Party makeup', 'Natural looks']
}

const generateLocalProvider = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const location = cities[Math.floor(Math.random() * cities.length)]
  
  // Select 1-2 random skills
  const skillTypes = Object.keys(skills)
  const numSkills = Math.random() > 0.5 ? 1 : 2
  const selectedSkills = []
  for(let i = 0; i < numSkills; i++) {
    const skill = skillTypes[Math.floor(Math.random() * skillTypes.length)]
    if(!selectedSkills.includes(skill)) selectedSkills.push(skill)
  }
  
  // Generate experience (2-10 years)
  const experience = `${Math.floor(Math.random() * 8) + 2} years`
  
  // Generate rating (4.0-5.0)
  const rating = (Math.random() * 1 + 4).toFixed(1)
  
  // Generate bio using the skill descriptions
  const mainSkill = selectedSkills[0]
  const skillDetails = skills[mainSkill]
  const specialty = skillDetails[Math.floor(Math.random() * skillDetails.length)]
  const bio = `Professional ${mainSkill.toLowerCase()} specializing in ${specialty.toLowerCase()}. ${
    selectedSkills.length > 1 ? `Also offers ${selectedSkills[1].toLowerCase()} services.` : ''
  }`

  return {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: `${firstName} ${lastName}`,
    skills: selectedSkills,
    location,
    experience,
    rating: parseFloat(rating),
    bio,
    imageURL: ''
  }
}

export { generateLocalProvider }

// Generate a set of providers for the given cities ensuring at least `perCityCount` providers per city.
const defaultServiceOrder = ['Tailor', 'Beautician', 'Mehendi Artist', 'Traditional Cook', 'Saree Designer', 'Jewellery Maker', 'Event Decorator', 'Makeup Artist']

const generateProvidersForCities = (cityList = cities, perServiceCount = 3) => {
  const results = []
  cityList.forEach((city) => {
    // For each service type in the city
    defaultServiceOrder.forEach((service) => {
      // Generate 3 providers for each service type
      for (let i = 0; i < perServiceCount; i++) {
        const provider = generateLocalProviderWithSkill(city, service)
        results.push(provider)
      }
    })
  })
  return results
}

// Helper to generate a provider for a specific city and primary skill
const generateLocalProviderWithSkill = (city, primarySkill) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const skillTypes = Object.keys(skills)
  // choose a second skill different from primary
  const otherSkillCandidates = skillTypes.filter(s => s !== primarySkill)
  const secondSkill = Math.random() > 0.5 ? otherSkillCandidates[Math.floor(Math.random() * otherSkillCandidates.length)] : null

  const selectedSkills = secondSkill ? [primarySkill, secondSkill] : [primarySkill]
  const experience = `${Math.floor(Math.random() * 8) + 2} years`
  const rating = parseFloat((Math.random() * 1 + 4).toFixed(1))
  const skillDetails = skills[primarySkill] || ['Skilled professional']
  const specialty = skillDetails[Math.floor(Math.random() * skillDetails.length)]
  const bio = `Professional ${primarySkill.toLowerCase()} specializing in ${specialty.toLowerCase()}. ${secondSkill ? `Also offers ${secondSkill.toLowerCase()} services.` : ''}`

  return {
    id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    name: `${firstName} ${lastName}`,
    skills: selectedSkills,
    location: city,
    experience,
    rating,
    bio,
    imageURL: ''
  }
}

export { generateProvidersForCities }