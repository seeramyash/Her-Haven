const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// Enable CORS for chatbot on port 5176, Women's Wellness on port 3001, her-connect on 8001, and CHAT on 8002
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5176',  // Chatbot
    'http://localhost:3001',   // Women's Wellness
    'http://localhost:8001',   // her-connect
    'http://localhost:8002'    // CHAT
  ];
  
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.static('public'));

// Serve the LAWSSSS static site under /law (this is the main Law Bot UI)
app.use('/law', express.static(path.join(__dirname, '..', 'LAWSSSS')));

// Stability AI configuration
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

// Routes
app.post('/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log('Received prompt:', prompt);
        
        if (!STABILITY_API_KEY) {
            throw new Error('Stability API key is not configured');
        }

        console.log('Attempting to generate image...');
        const response = await axios.post(
            STABILITY_API_URL,
            {
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                height: 1024,
                width: 1024,
                steps: 30,
                samples: 1
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${STABILITY_API_KEY}`
                }
            }
        );

        if (!response.data || !response.data.artifacts || !response.data.artifacts[0]) {
            throw new Error('Invalid response from Stability API');
        }

        // Convert the base64 image to a data URL
        const imageBase64 = response.data.artifacts[0].base64;
        const imageUrl = `data:image/png;base64,${imageBase64}`;

        console.log('Image generated successfully');
        res.json({ url: imageUrl });
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            name: error.name,
            status: error.response?.status,
            data: error.response?.data
        });
        res.status(500).json({ 
            error: 'Failed to generate image',
            details: error.response?.data?.message || error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});