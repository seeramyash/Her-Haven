import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
const API_VERSION = process.env.GEMINI_API_VERSION || 'v1beta';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/models', async (_req, res) => {
  try {
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models?key=${GEMINI_API_KEY}`;
    const r = await fetch(url);
    const raw = await r.text();
    let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}
    if (!r.ok) return res.status(r.status).json(data || { error: raw || 'Upstream error' });
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'List models failed' });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Server misconfigured: missing GEMINI_API_KEY' });
    }
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message' });
    }

    const prompt = message; // already composed in client
    console.log('proxy> request', { model: MODEL, promptPreview: prompt.slice(0, 120) });

    const baseUrl = `https://generativelanguage.googleapis.com/${API_VERSION}/models`;
    const candidates = Array.from(new Set([
      MODEL,
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.0-pro-latest',
      'gemini-1.0-pro',
    ]));

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
          ],
        },
      ],
      generationConfig: { temperature: 0.2 },
    };

    let lastStatus = 0;
    let lastRaw = '';
    for (const model of candidates) {
      const url = `${baseUrl}/${model}:generateContent?key=${GEMINI_API_KEY}`;
      console.log('proxy> trying model', model);
      const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const raw = await r.text();
      if (!r.ok) {
        lastStatus = r.status; lastRaw = raw;
        console.error('proxy> upstream error', r.status, raw);
        // Try next candidate
        continue;
      }
      let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) {
        console.log('proxy> success with', model);
        return res.json({ text, model });
      }
      // If empty, keep trying
      lastStatus = 200; lastRaw = raw;
    }

    return res.status(lastStatus || 502).json({ error: lastRaw || 'No model produced a response' });
  } catch (e) {
    console.error('proxy> exception', e);
    return res.status(500).json({ error: 'Proxy failed' });
  }
});

app.listen(PORT, () => {
  console.log(`LAWSSSS server listening on ${PORT}`);
});
