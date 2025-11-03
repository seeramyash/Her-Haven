import { exec, spawn } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs } from "fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fetch from "node-fetch";

dotenv.config();

// In-memory session store: sessionId -> [{ role: 'user'|'assistant', content: string }]
const sessions = new Map();

const dataUrlToBuffer = (dataUrl) => {
  if (!dataUrl) return null;
  const idx = dataUrl.indexOf(",");
  if (idx === -1) return null;
  const base64 = dataUrl.slice(idx + 1);
  return Buffer.from(base64, "base64");
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "25mb" }));
app.use(cors());
const port = 3000;

// Ollama config (local LLM)
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";

// OpenRouter (hosted LLM) config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"; // set via env for your account

// TTS engine selection
const TTS_ENGINE = (process.env.TTS_ENGINE || "sapi").toLowerCase(); // azure|piper|sapi

// Azure TTS config (optional, for human-like neural voices)
const AZURE_TTS_KEY = process.env.AZURE_TTS_KEY || "";
const AZURE_TTS_REGION = process.env.AZURE_TTS_REGION || ""; // e.g., eastus, westeurope
const AZURE_TTS_VOICE = process.env.AZURE_TTS_VOICE || "en-US-AriaNeural"; // female neural

// Piper TTS config
const PIPER_EXE = process.env.PIPER_EXE || "piper"; // assumes on PATH
const PIPER_MODEL = process.env.PIPER_MODEL || path.join(__dirname, "voices", "en_US-amy-medium.onnx");
const PIPER_SPEAKER = process.env.PIPER_SPEAKER || ""; // optional multi-speaker index
const PIPER_LENGTH = process.env.PIPER_LENGTH || ""; // optional length_scale like 0.9..1.2
const SAPI_VOICE = process.env.SAPI_VOICE || ""; // optional exact SAPI voice name (e.g., "Microsoft Zira Desktop")

// Rhubarb executable path
const rhubarbPath = process.platform === "win32"
  ? path.join(__dirname, "bin", "rhubarb.exe")
  : path.join(__dirname, "bin", "rhubarb");

// FFmpeg executable (allow overriding via .env)
const FFMPEG_EXE = process.env.FFMPEG_EXE || "ffmpeg";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Ensure audios folder exists at startup
(async () => {
  try {
    await fs.mkdir(path.join(__dirname, "audios"), { recursive: true });
  } catch {}
})();

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        const err = new Error(stderr || error.message || "Command failed");
        err.cmd = command;
        return reject(err);
      }
      resolve(stdout);
    });
  });
};

async function listInstalledModels() {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!r.ok) return [];
    const j = await r.json();
    return (j?.models || []).map(m => m.name);
  } catch { return []; }
}

async function ensureOllamaUp() {
  try {
    const ok = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET' });
    if (ok?.ok) return true;
  } catch {}
  // Try to start ollama serve in background (Windows typical paths or PATH)
  try {
    const candidates = [
      process.env.OLLAMA_PATH,
      'ollama',
      `${process.env.LOCALAPPDATA}\\Programs\\Ollama\\ollama.exe`,
      `${process.env.ProgramFiles}\\Ollama\\ollama.exe`,
    ].filter(Boolean);
    for (const exe of candidates) {
      try {
        const child = spawn(exe, ['serve'], { detached: true, stdio: 'ignore' });
        child.unref?.();
        break;
      } catch {}
    }
  } catch {}
  // Wait up to 8s for server
  const start = Date.now();
  while (Date.now() - start < 8000) {
    try {
      const r = await fetch(`${OLLAMA_URL}/api/tags`);
      if (r?.ok) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

function resolveRequestedModel(requested, images) {
  const wantsVision = (requested === 'llava') || (Array.isArray(images) && images.length > 0);
  // Explicit names we prefer
  const preferred = wantsVision ? ['llava:7b', 'llava:latest', 'llava'] : ['llama3.1:8b', 'llama3.1:8b-instruct', 'llama3.1', 'llama:8b'];
  return { wantsVision, preferred };
}

async function callOllamaChat(userMessage, history = [], imagesBase64 = [], modelNameOverride = "") {
  // make sure Ollama is running
  await ensureOllamaUp();
  const systemPrompt = `You are a virtual girlfriend.
You must reply ONLY with strict JSON like this shape (no extra text):
{
  "messages": [
    { "text": "...", "facialExpression": "smile|sad|angry|surprised|funnyFace|default", "animation": "Talking_0|Talking_1|Talking_2|Crying|Laughing|Rumba|Idle|Terrified|Angry" }
  ]
}
Return between 1 and 3 messages.
Keep consistency with the ongoing conversation context that will be provided.
`;

  // Build user message with optional images (Llava/Moondream)
  let imgs = imagesBase64 || [];
  if (!Array.isArray(imgs)) imgs = [imgs].filter(Boolean);
  const conv = (s) => {
    if (!s) return null;
    if (s.startsWith("data:")) {
      const idx = s.indexOf(",");
      if (idx !== -1) return s.slice(idx + 1);
    }
    return s;
  };
  const cleaned = imgs.map(conv).filter(Boolean);
  const userMsg = { role: "user", content: userMessage || (cleaned.length ? "Describe this image" : "Hello") };
  // Attach images if any; model resolver will select a vision model when images are present
  if (cleaned.length) userMsg.images = cleaned;

  const ollamaMessages = [
    { role: "system", content: systemPrompt },
    ...history, // prior {role, content}
    userMsg,
  ];

  // Decide the model to use by checking what's installed. If requested isn't installed, pick closest available.
  const { wantsVision, preferred } = resolveRequestedModel(modelNameOverride, cleaned);
  const installed = await listInstalledModels();
  // Prefer exact match; otherwise fuzzy match by prefix
  let modelToUse = preferred.find(p => installed.includes(p));
  if (!modelToUse) modelToUse = preferred.find(p => installed.some(n => n.startsWith(p.split(':')[0])));
  if (!modelToUse) modelToUse = preferred[0];
  // Fallback to the other family if nothing found
  const hasModel = installed.includes(modelToUse) || installed.some(n => n.startsWith(modelToUse.split(':')[0]));
  if (!hasModel) {
    const alt = wantsVision ? ['llava'] : ['llama3.1:8b'];
    modelToUse = installed.find(n => alt.some(a => n.startsWith(a))) || modelToUse;
  }

  const resp = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: modelToUse,
      messages: ollamaMessages,
      stream: false,
      format: "json",
      options: { num_gpu: 999, num_ctx: 4096 }
    }),
  });

  if (!resp.ok) {
    // Fallback to /api/generate (older Ollama versions or models without chat)
    const prompt = `${systemPrompt}\n` +
      (history || []).map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n") +
      `\nUSER: ${userMsg.content}`;
    const genBody = {
      model: modelToUse,
      prompt,
      images: userMsg.images || undefined,
      stream: false,
      format: "json",
      options: { num_gpu: 999, num_ctx: 4096 },
    };
    const gen = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(genBody),
    });
    if (!gen.ok) {
      throw new Error(`Ollama error: ${gen.status} ${gen.statusText}`);
    }
    const g = await gen.json();
    const rawGen = (g?.response || "").trim();
    const raw = rawGen || "{}";
    let parsed;
    try { parsed = JSON.parse(raw); } catch (e) {
      const s = raw.indexOf("{"); const eix = raw.lastIndexOf("}");
      if (s !== -1 && eix !== -1 && eix > s) parsed = JSON.parse(raw.slice(s, eix + 1)); else throw e;
    }
    let messages = parsed.messages || parsed || [];
    if (!Array.isArray(messages)) messages = [];
    return messages.slice(0, 3);
  }
  const data = await resp.json();
  const raw = data?.message?.content?.trim?.() || "{}";

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // Try to salvage JSON from text
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      parsed = JSON.parse(raw.slice(start, end + 1));
    } else {
      throw e;
    }
  }
  let messages = parsed.messages || parsed || [];
  if (!Array.isArray(messages)) messages = [];
  return messages.slice(0, 3);
}

async function ttsViaAzure(text, wavPath) {
  if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) {
    throw new Error("Azure TTS not configured");
  }
  const endpoint = `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const ssml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<speak version=\"1.0\" xml:lang=\"en-US\">
  <voice name=\"${AZURE_TTS_VOICE}\">${text}</voice>
</speak>`;
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_TTS_KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "riff-16khz-16bit-mono-pcm",
      "User-Agent": "r3f-virtual-gf/1.0",
    },
    body: ssml,
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Azure TTS HTTP ${resp.status}: ${txt}`);
  }
  const arrayBuf = await resp.arrayBuffer();
  await fs.writeFile(path.resolve(wavPath), Buffer.from(arrayBuf));
}

// Piper TTS (local)
async function ttsViaPiper(text, wavPath) {
  if (!PIPER_EXE || !PIPER_MODEL) {
    throw new Error("Piper not configured (PIPER_EXE/PIPER_MODEL)");
  }
  await new Promise((resolve, reject) => {
    const args = ["--model", PIPER_MODEL, "--output_file", path.resolve(wavPath)];
    if (PIPER_SPEAKER) args.push("--speaker", String(PIPER_SPEAKER));
    if (PIPER_LENGTH) args.push("--length_scale", String(PIPER_LENGTH));

    // Spawn Piper with espeak data and DLLs accessible
    const piperDir = path.dirname(PIPER_EXE);
    const child = spawn(PIPER_EXE, args, {
      stdio: ["pipe", "ignore", "pipe"],
      env: {
        ...process.env,
        PIPER_ESPEAK_DATA: path.join(piperDir, "espeak-ng-data"),
        PATH: `${piperDir}${path.delimiter}${process.env.PATH || ""}`,
      },
    });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`piper exited with code ${code}: ${stderr}`));
    });
    child.stdin.write(text);
    child.stdin.end();
  });
}

async function ttsViaSapi(text, wavPath) {
  // Windows built-in SAPI fallback (no external deps)
  // Prefer a female voice if available, or use SAPI_VOICE if specified.
  const outPath = path.resolve(wavPath).replace(/'/g, "''");
  const voiceName = (SAPI_VOICE || "").replace(/'/g, "''");
  const ps = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  if ('${voiceName}'.Length -gt 0) {
    $synth.SelectVoice('${voiceName}')
  } else {
    # Try to pick a female voice
    $synth.SelectVoiceByHints([System.Speech.Synthesis.VoiceGender]::Female)
  }
} catch {}
# 16kHz, 16-bit, mono to best match Rhubarb
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(16000,[System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,[System.Speech.AudioFormat.AudioChannel]::Mono)
$synth.SetOutputToWaveFile('${outPath}', $format)
$synth.Speak([Console]::In.ReadToEnd())
$synth.Dispose()
`;
  await new Promise((resolve, reject) => {
    const shell = process.platform === "win32" ? "powershell.exe" : "pwsh";
    const child = spawn(shell, [
      "-NoProfile",
      "-ExecutionPolicy","Bypass",
      "-Command",
      ps,
    ], { stdio: ["pipe", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (e) => reject(e));
    child.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`SAPI TTS failed with code ${code}: ${stderr}`));
    });
    child.stdin.write(text);
    child.stdin.end();
  });
}

async function ttsToWav(text, wavPath) {
  // Preferred engine first
  if (TTS_ENGINE === "piper") {
    try { await ttsViaPiper(text, wavPath); return; } catch (e) { console.warn("Piper TTS failed, trying Azure/SAPI:", e?.message || e); }
  }
  if (TTS_ENGINE === "azure") {
    if (AZURE_TTS_KEY && AZURE_TTS_REGION) {
      try { await ttsViaAzure(text, wavPath); return; } catch (e) { console.warn("Azure TTS failed, trying SAPI:", e?.message || e); }
    } else {
      console.warn("Azure selected but AZURE_TTS_KEY/REGION not set; falling back to SAPI");
    }
  }
  if (TTS_ENGINE === "sapi") {
    await ttsViaSapi(text, wavPath); return;
  }
  // Try Piper second if not selected
  try { await ttsViaPiper(text, wavPath); return; } catch {}
  // Then Azure if configured
  if (AZURE_TTS_KEY && AZURE_TTS_REGION) {
    try { await ttsViaAzure(text, wavPath); return; } catch {}
  }
  // Finally SAPI
  await ttsViaSapi(text, wavPath);
}

async function getWavDurationSeconds(wavPath) {
  // Minimal WAV header parser to get duration
  const buf = await fs.readFile(wavPath);
  const findChunk = (id) => {
    for (let i = 12; i < buf.length - 8; ) {
      const chunkId = buf.toString("ascii", i, i + 4);
      const size = buf.readUInt32LE(i + 4);
      if (chunkId === id) return { offset: i + 8, size };
      i += 8 + size;
    }
    return null;
  };
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
    return 0;
  }
  const fmt = findChunk("fmt ");
  const data = findChunk("data");
  if (!fmt || !data) return 0;
  const byteRate = buf.readUInt32LE(fmt.offset + 8); // at offset 16 of fmt chunk
  if (!byteRate) return 0;
  return data.size / byteRate;
}

async function prepareWavForRhubarb(srcWavRel) {
  const absSrc = path.resolve(srcWavRel);
  const tmp16k = absSrc.replace(/\.wav$/i, "_16k.wav");
  const cmd = `"${FFMPEG_EXE}" -y -i "${absSrc}" -ar 16000 -ac 1 "${tmp16k}"`;
  try {
    await execCommand(cmd);
    return tmp16k;
  } catch (e) {
    // ffmpeg not available or failed — use original wav
    return absSrc;
  }
}

async function lipSyncFromWav(index) {
  const wavRel = path.join("audios", `message_${index}.wav`);
  const wavAbs = await prepareWavForRhubarb(wavRel);
  const jsonAbs = path.resolve(path.join("audios", `message_${index}.json`));
  const cmd = `"${rhubarbPath}" -f json -o "${jsonAbs}" "${wavAbs}" -r phonetic`;
  await execCommand(cmd);
  return { wavAbs, jsonAbs };
}

async function wavToMp3(wavPath, mp3Path) {
  const cmd = `"${FFMPEG_EXE}" -y -i "${wavPath}" "${mp3Path}"`;
  try {
    await execCommand(cmd);
    return true;
  } catch (e) {
    console.warn("ffmpeg failed, using WAV directly:", e?.message || e);
    return false;
  }
}

app.post("/websearch", async (req, res) => {
  try {
    const q = (req.body?.q || '').toString().trim();
    if (!q) return res.status(400).send({ error: 'q required' });

    // Special case: current date/time queries
    const lower = q.toLowerCase();
    if (/\b(today|current date|date today|what'?s the date|current time|time now|what'?s the time)\b/.test(lower)) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz });
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short', timeZone: tz });
      return res.send({ heading: 'Current date & time', abstract: `${dateStr} ${timeStr}`, timezone: tz });
    }

    let result = {};

    // 1) Try Wikipedia REST search (near real-time updates for major topics)
    try {
      const s = await fetch(`https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(q)}&limit=1`);
      if (s.ok) {
        const sj = await s.json();
        const page = sj?.pages?.[0];
        if (page?.title) {
          const title = page.title;
          const sum = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
          if (sum.ok) {
            const sj2 = await sum.json();
            result = {
              heading: sj2?.title || title,
              abstract: sj2?.extract || '',
              url: sj2?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`
            };
          }
        }
      }
    } catch {}

    // 2) Fallback to DuckDuckGo Instant Answer if Wikipedia yields nothing useful
    if (!result.abstract) {
      try {
        const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
        const r = await fetch(ddgUrl);
        const j = await r.json();
        result = {
          heading: j?.Heading || result.heading || '',
          abstract: j?.AbstractText || result.abstract || '',
          related: (j?.RelatedTopics || []).slice(0, 5).map(rt => rt?.Text || '').filter(Boolean),
          url: result.url || ''
        };
      } catch {}
    }

    res.send(result);
  } catch (e) {
    res.status(500).send({ error: e?.message || 'websearch failed' });
  }
});

// Proxy endpoint for OpenRouter chat completions (avoids exposing API key to browsers)
app.post("/openrouter/chat", async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY) return res.status(500).send({ error: "OPENROUTER_API_KEY not set on server" });

    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const prompt = (req.body?.prompt || '').toString();
    const model = (req.body?.model || OPENROUTER_MODEL).toString();

    const payload = messages.length > 0 ? { model, messages } : {
      model,
      messages: [{ role: 'user', content: prompt || 'Hello' }]
    };

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://github.com/seeramyash/Her-Haven',
        'X-Title': 'Her Haven Backend'
      },
      body: JSON.stringify(payload)
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      return res.status(r.status).send({ error: `OpenRouter ${r.status}: ${txt}` });
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || '';

    // Optional: map to virtual-gf message format
    return res.send({ content });
  } catch (e) {
    res.status(500).send({ error: e?.message || 'openrouter failed' });
  }
});

app.get("/ttscheck", async (req, res) => {
  try {
    const wav = path.join("audios", "piper_check.wav");
    await ttsToWav("Hello from Piper. This is a check.", wav);
    res.send({ ok: true, file: wav });
  } catch (e) {
    res.status(500).send({ error: e?.message || "ttscheck failed" });
  }
});

app.post("/transcribe", async (req, res) => {
  try {
    const audio = req.body.audio || "";
    if (!audio) return res.status(400).send({ error: "audio missing" });
    const buf = (audio.startsWith("data:")) ? Buffer.from(audio.split(',')[1], 'base64') : Buffer.from(audio, 'base64');
    const rawPath = path.resolve(path.join("audios", `input_${Date.now()}.webm`));
    await fs.writeFile(rawPath, buf);
    const wavInput = rawPath.replace(/\.webm$/i, ".wav");
    const cmd = `"${FFMPEG_EXE}" -y -i "${rawPath}" -ar 16000 -ac 1 "${wavInput}"`;
    await execCommand(cmd).catch(() => {});
    const text = await transcribeViaSapi(wavInput);
    res.send({ text });
  } catch (e) {
    res.status(500).send({ error: e?.message || "transcribe failed" });
  }
});

app.post("/chat", async (req, res) => {
  try {
    let userMessage = req.body.message;
    const image = req.body.image || ""; // optional single image data URL (backward compat)
    const images = Array.isArray(req.body.images) ? req.body.images : (image ? [image] : []);
    const audio = req.body.audio || ""; // optional base64 data URL or raw base64
    const requestedModel = (req.body.model || "").toString().toLowerCase(); // 'llama' | 'llava' or explicit
    const sessionId = req.body.sessionId || req.get("x-session-id") || "default";
    const reset = Boolean(req.body.reset);
    if (reset) sessions.delete(sessionId);

    // If audio provided and no text, transcribe via Windows SAPI
    if (!userMessage && audio) {
      try {
        const buf = dataUrlToBuffer(audio) || Buffer.from(audio, "base64");
        const rawPath = path.resolve(path.join("audios", `input_${Date.now()}.webm`));
        await fs.writeFile(rawPath, buf);
        const wavInput = rawPath.replace(/\.webm$/i, ".wav");
        const cmd = `"${FFMPEG_EXE}" -y -i "${rawPath}" -ar 16000 -ac 1 "${wavInput}"`;
        await execCommand(cmd).catch(() => {});
        userMessage = await transcribeViaSapi(wavInput);
      } catch (e) {
        console.warn("Audio transcription failed:", e?.message || e);
      }
    }

    if (!userMessage && images.length === 0) {
      res.send({
        messages: [
          {
            text: "Hey dear... How was your day?",
            audio: await audioFileToBase64("audios/intro_0.wav"),
            lipsync: await readJsonTranscript("audios/intro_0.json"),
            facialExpression: "smile",
            animation: "Talking_1",
          },
          {
            text: "I missed you so much... Please don't go for so long!",
            audio: await audioFileToBase64("audios/intro_1.wav"),
            lipsync: await readJsonTranscript("audios/intro_1.json"),
            facialExpression: "sad",
            animation: "Crying",
          },
        ],
      });
      return;
    }

    let messages;
    const history = sessions.get(sessionId) || [];
    try {
      messages = await callOllamaChat(userMessage, history, images, requestedModel || "llama");
    } catch (e) {
      console.warn("Ollama failed, using fallback message:", e?.message || e);
      const anims = ["Talking_0","Talking_1","Talking_2","Laughing","Idle"]; // must exist in animations.glb
      const exprs = ["smile","surprised","angry","sad","default","funnyFace"];
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      messages = [
        {
          text: "I'm here and listening.",
          facialExpression: pick(exprs),
          animation: pick(anims),
        },
      ];
    }

    const pickAnimExprFromText = (text, expr, anim) => {
      const t = (text || "").toLowerCase();
      const safeExpr = expr || (/(haha|lol|\bthanks\b|great|awesome|nice)/.test(t) ? "smile" : /\b(sad|sorry|miss|cry|unhappy)\b/.test(t) ? "sad" : /\b(angry|mad|furious)\b/.test(t) ? "angry" : /[?]/.test(t) ? "default" : "default");
      let chosen = anim;
      if (!chosen) {
        if (/[?]/.test(t) || /\b(how|what|why|who|where|when|can|could|would|should|is|are|do|does|did)\b/.test(t)) {
          const talking = ["Talking_0","Talking_1","Talking_2"];
          chosen = talking[Math.floor(Math.random()*talking.length)];
        } else if (/\b(haha|lol|joke|funny|lmao)\b/.test(t)) {
          chosen = "Laughing";
        } else if (/\b(sad|sorry|cry|miss)\b/.test(t)) {
          chosen = "Crying";
        } else if (/\b(angry|mad|furious)\b/.test(t)) {
          chosen = "Angry";
        } else if (/\b(scared|afraid|shock|terrified)\b/.test(t)) {
          chosen = "Terrified";
        } else if (/\b(dance|party|music)\b/.test(t)) {
          chosen = "Rumba";
        } else {
          const talking = ["Talking_0","Talking_1","Talking_2"];
          chosen = talking[Math.floor(Math.random()*talking.length)];
        }
      }
      return { expr: safeExpr, anim: chosen };
    };

    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      const picked = pickAnimExprFromText(m.text, m.facialExpression, m.animation);
      m.facialExpression = picked.expr;
      m.animation = picked.anim;
      const wav = path.join("audios", `message_${i}.wav`);
      const mp3 = path.join("audios", `message_${i}.mp3`);

      try {
        // TTS -> WAV via Piper with SAPI fallback
        await ttsToWav(m.text, wav);

        // Generate lipsync JSON from WAV (absolute paths, resampled if needed)
        let lipsyncOk = false;
        try {
          const { wavAbs } = await lipSyncFromWav(i);
          lipsyncOk = true;
        } catch (lipErr) {
          console.warn("Rhubarb failed, will synthesize fallback mouth cues:", lipErr?.message || lipErr);
        }

        // Attach assets (prefer WAV for reliability)
        m.audio = await audioFileToBase64(wav);
        m.audioMime = "audio/wav";

        // Attach lipsync
        if (lipsyncOk) {
          m.lipsync = await readJsonTranscript(path.join("audios", `message_${i}.json`));
        } else {
          const dur = await getWavDurationSeconds(path.resolve(wav));
          m.lipsync = generateFallbackMouthCues(m.text || "", dur || 2.0);
        }
      } catch (e) {
        console.warn(`Failed to generate AV assets for message ${i}:`, e?.message || e);
        // Provide minimal fallback so frontend still works
        m.audio = m.audio || ""; // Avatar guards for missing audio
        m.audioMime = m.audioMime || "audio/wav";
        const dur = await getWavDurationSeconds(path.resolve(wav));
        m.lipsync = generateFallbackMouthCues(m.text || "", dur || 2.0);
      }
    }

    // Update session history (trim to recent exchanges)
    try {
      const assistantJoin = messages.map(m => m.text).join(" \n");
      const next = [...history, { role: "user", content: userMessage }, { role: "assistant", content: assistantJoin }];
      // Keep last 10 entries
      const trimmed = next.slice(-10);
      sessions.set(sessionId, trimmed);
    } catch {}

    res.send({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to generate response" });
  }
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

async function transcribeViaSapi(wavAbsPath) {
  const ps = `
Add-Type -AssemblyName System.Speech
$rec = New-Object System.Speech.Recognition.SpeechRecognitionEngine([System.Globalization.CultureInfo]::("en-US"))
$rec.LoadGrammar([System.Speech.Recognition.DictationGrammar]::new())
$rec.SetInputToWaveFile('${wavAbsPath.replace(/'/g, "''")}')
$rec.BabbleTimeout = [TimeSpan]::FromSeconds(0)
$rec.InitialSilenceTimeout = [TimeSpan]::FromSeconds(0.5)
$rec.EndSilenceTimeout = [TimeSpan]::FromSeconds(0.3)
$rx = $rec.Recognize()
$rec.Dispose()
if ($rx) { $rx.Text } else { '' }
`;
  return await new Promise((resolve, reject) => {
    const shell = process.platform === "win32" ? "powershell.exe" : "pwsh";
    const child = spawn(shell, ["-NoProfile","-ExecutionPolicy","Bypass","-Command", ps], { stdio: ["ignore","pipe","pipe"] });
    let out = ""; let err = "";
    child.stdout.on("data", d => out += d.toString());
    child.stderr.on("data", d => err += d.toString());
    child.on("close", code => {
      if (code === 0) resolve(out.trim()); else reject(new Error(err || `SAPI STT exited ${code}`));
    });
  });
}

function generateFallbackMouthCues(text, durationSec = 2.0) {
  const letters = (text || "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split("");
  const toViseme = (a, b) => {
    const pair = (a || "") + (b || "");
    if (pair.startsWith("th")) return "H"; // TH
    if (/^[pbm]$/.test(a)) return "A"; // closed lips
    if (/^[fv]$/.test(a)) return "G"; // FF
    if (/^[o]$/.test(a)) return "E"; // O
    if (/^[uuw]$/.test(a)) return "F"; // U
    if (/^[a]$/.test(a)) return "D"; // AA
    if (/^[eiiy]$/.test(a)) return "C"; // I
    if (/^[kgxqg]$/.test(a)) return "B"; // K
    if (a === " ") return "X"; // rest
    return "C"; // default mid
  };
  // Build raw viseme sequence
  const raw = [];
  for (let i = 0; i < letters.length; i++) {
    raw.push(toViseme(letters[i], letters[i + 1]));
  }
  // Collapse repeats
  const seq = [];
  for (const v of raw) {
    if (seq.length === 0 || seq[seq.length - 1] !== v) seq.push(v);
  }
  const n = Math.max(1, seq.length);
  const step = durationSec / n;
  const mouthCues = seq.map((v, i) => ({ start: i * step, end: (i + 1) * step, value: v }));
  return { mouthCues };
}

app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});
