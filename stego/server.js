const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cookieParser());
// Disable caching so Back button won't show protected pages
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// CORS: allow origins from env (comma-separated), else allow all
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const envList = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!envList.length) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else if (origin && envList.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Dynamic navbar HTML using production URLs (hide Login & Framer; open in same tab)
app.get('/components/navbar.html', (_req, res) => {
  const WELLNESS = process.env.NAV_WELLNESS_URL || 'https://womenswellnessreports.onrender.com';
  const LAW = process.env.NAV_LAW_URL || 'https://law-bot-iy5m.onrender.com';
  const HER_CONNECT = process.env.NAV_HER_CONNECT_URL || 'https://connect-xptr.onrender.com';
  const CHATBOT = process.env.NAV_CHATBOT_URL || 'https://chat-bot-3xrm.onrender.com';
  const STEGO = process.env.NAV_STEGO_URL || '/';
  const html = `<!doctype html>
<nav class="navbar">
  <a class="nav-icon" href="${WELLNESS}" title="Wellness Tracker" target="_self"><i class="fas fa-droplet"></i></a>
  <a class="nav-icon" href="${LAW}" title="Law Bot" target="_self"><i class="fas fa-scale-balanced"></i></a>
  <a class="nav-icon" href="${HER_CONNECT}" title="Her Connect" target="_self"><i class="fas fa-hands-helping"></i></a>
  <a class="nav-icon" href="${CHATBOT}" title="Chat Bot" target="_self"><i class="fas fa-robot"></i></a>
  <a class="nav-icon" href="${STEGO}" title="Steganography" target="_self"><i class="fas fa-image"></i></a>
</nav>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Auth guard (after CORS, before static)
const LOGIN_URL = process.env.NAV_LOGIN_URL || 'https://her-haven.onrender.com';
app.use((req, res, next) => {
  const bypasses = ['/health', '/components/navbar.html', '/global/navbar.css', '/nav.js', '/lib/', '/favicon', '/auth/callback', '/logout'];
  if (bypasses.some(p => req.path === p || req.path.startsWith(p))) return next();
  const isAsset = /\.(css|js|png|jpg|jpeg|svg|ico|map|txt)$/i.test(req.path);
  if (isAsset) return next();
  const authed = req.headers.cookie && req.headers.cookie.includes('hh_auth=1');
  if (!authed) {
    const redirect = encodeURIComponent(`${req.protocol}://${req.headers.host}${req.originalUrl}`);
    return res.redirect(302, `${LOGIN_URL}?redirect=${redirect}`);
  }
  next();
});

app.use(express.static('public'));

// Simple health check for Render
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// Serve the LAWSSSS static site under /law (this is the main Law Bot UI)
app.use('/law', express.static(path.join(__dirname, '..', 'LAWSSSS')));

// Authentication callbacks
app.get('/auth/callback', (req, res) => {
  const { auth, token, redirect } = req.query;
  if (auth === '1' || token) {
    res.cookie('hh_auth', '1', { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
    return res.redirect(302, redirect || '/');
  }
  return res.status(400).json({ ok: false, error: 'Missing auth parameters' });
});

app.get('/logout', (req, res) => {
  res.clearCookie('hh_auth', { httpOnly: true, secure: true, sameSite: 'lax' });
  return res.redirect(302, LOGIN_URL);
});

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

const host = '0.0.0.0';
app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});
