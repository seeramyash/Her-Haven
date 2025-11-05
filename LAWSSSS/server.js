import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const body = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const raw = await r.text();
    if (!r.ok) {
      console.error('proxy> upstream error', r.status, raw);
      // Try parse error for consistency
      let parsedErr = null; try { parsedErr = raw ? JSON.parse(raw) : null; } catch {}
      return res.status(r.status).json(parsedErr?.error ? parsedErr : { error: raw || 'Upstream error' });
    }

    let data = null; try { data = raw ? JSON.parse(raw) : null; } catch {}
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('proxy> success');
    return res.json({ text });
  } catch (e) {
    console.error('proxy> exception', e);
    return res.status(500).json({ error: 'Proxy failed' });
  }
});

app.listen(PORT, () => {
  console.log(`LAWSSSS server listening on ${PORT}`);
});
