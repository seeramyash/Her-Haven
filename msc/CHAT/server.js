const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
    cors: {
        origin: "*",  // Allow all origins
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});
const path = require('path');
const multer = require('multer');
const ledger = require('./blockchain/ledger');
const fetch = require('node-fetch');

// Sample user database (in a real app, this would be in a database)
const users = {
    'user1': { username: 'Mama', avatar: '👨‍💻' },
    'user2': { username: 'Dhoma', avatar: '👩‍💻' },
    'user3': { username: 'Puma', avatar: '👨‍🎨' },
    'user4': { username: 'Comma', avatar: '👩‍🎨' },
    'user5': { username: 'Alex', avatar: '👨‍🔬' }
};

// Vulgar words list
const VULGAR_WORDS = [
  'fuck',
  'bitch',
  'shit',
  'asshole',
  'bastard',
  'dick',
  'pussy',
  'cunt',
  'slut',
  'fag',
  'motherfucker',
  'whore',
  'douche',
  'bollocks',
  'bugger',
  'bloody',
  'bollock',
  'arse',
  'wanker',
  'prick',
  'twat',
  'cock',
  'crap',
  'damn',
  'shithead',
  'douchebag',
  'jackass',
  'jerk',
  'piss',
  'shitface',
  'son of a bitch',
  'tit',
  'tosser',
  'twit',
];

// Track user violations by socket ID
const userViolations = {};

function censorMessage(message) {
  let found = false;
  let censored = message;
  VULGAR_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(censored)) {
      found = true;
      censored = censored.replace(regex, '*'.repeat(word.length));
    }
  });
  return { censored, found };
}

// Serve static files from the public directory
app.use(express.static('public'));
// JSON body parser for API endpoints
app.use(express.json());
// CORS for frontend (her-connect)
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check for Render
app.get('/health', (req, res) => {
    res.status(200).json({ ok: true });
});

// Handle file uploads
app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({ 
            success: true, 
            file: {
                path: '/uploads/' + req.file.filename,
                type: req.file.mimetype
            }
        });
    } else {
        res.json({ success: false });
    }
});

// --------- Local "blockchain" ledger for UPI masked meta (runs fully offline) ---------
// Record a UPI payment event with masked metadata into an append-only chain
app.post('/upi/record', (req, res) => {
    const { vpa, amount, maskedMeta, reference, payer, note } = req.body || {};

    if (!maskedMeta && !vpa) {
        return res.status(400).json({ ok: false, error: 'Provide maskedMeta or vpa' });
    }
    if (amount == null) {
        return res.status(400).json({ ok: false, error: 'amount is required' });
    }

    // Mask VPA if provided (e.g., name@bank -> na***@bank)
    const maskVpa = (val) => {
        try {
            const [user, bank] = String(val).split('@');
            if (!user || !bank) return String(val).replace(/.(?=.{2})/g, '*');
            const head = user.slice(0, 2);
            const maskedUser = head + '*'.repeat(Math.max(1, user.length - 2));
            return `${maskedUser}@${bank}`;
        } catch { return val; }
    };

    const payload = {
        meta: { type: 'UPI_MASKEDMETA', version: 1 },
        amount: Number(amount),
        maskedVpa: maskedMeta?.maskedVpa || (vpa ? maskVpa(vpa) : undefined),
        maskedMeta: maskedMeta || undefined,
        reference: reference || null,
        payer: payer || null,
        note: note || null
    };

    const block = ledger.addBlock(payload);
    return res.json({ ok: true, txHash: block.hash, index: block.index, timestamp: block.timestamp });
});

// Fetch a recorded event by block hash
app.get('/upi/tx/:hash', (req, res) => {
    const block = ledger.getBlockByHash(req.params.hash);
    if (!block) return res.status(404).json({ ok: false, error: 'Not found' });
    return res.json({ ok: true, block });
});

// Get an audit-friendly view of the chain (no sensitive data)
app.get('/upi/audit', (req, res) => {
    const chain = ledger.getChain();
    const audit = chain.map(b => ({
        index: b.index,
        timestamp: b.timestamp,
        hash: b.hash,
        prevHash: b.prevHash,
        amount: b.data?.amount ?? null,
        type: b.data?.meta?.type ?? null,
    }));
    return res.json({ ok: true, audit, length: chain.length });
});

// Verify the entire chain integrity
app.get('/ledger/verify', (req, res) => {
    const result = ledger.verifyChain();
    return res.json({ ok: result.ok, error: result.error || null, length: result.length });
});

// --------- Hathor (actual) integration via local headless wallet (optional) ---------
const HATHOR_HEADLESS = process.env.HATHOR_HEADLESS || 'http://127.0.0.1:8000';

app.get('/hathor/status', async (req, res) => {
    try {
        const r = await fetch(HATHOR_HEADLESS + '/health');
        const text = await r.text();
        return res.json({ ok: r.ok, status: text });
    } catch (e) {
        return res.status(503).json({ ok: false, error: 'Headless not reachable at ' + HATHOR_HEADLESS });
    }
});

// Pay with HTR using a locally running headless wallet.
// Requires: docker run -p 8000:8000 hathornetwork/hathor-wallet-headless:latest (and start a wallet)
app.post('/hathor/pay', async (req, res) => {
    return res.status(410).json({ ok: false, error: 'Hathor disabled' });
});

// Polygon Amoy server-side endpoints removed; client now uses MetaMask directly.

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected. Socket ID:', socket.id);
    
    // Send connection confirmation to the client
    socket.emit('user assigned', { socketId: socket.id });
    
    // Broadcast new user to all clients
    io.emit('user joined', { socketId: socket.id });

    // Handle new messages
    socket.on('chat message', (msg) => {
        // Censor vulgar words
        const { censored, found } = censorMessage(msg.content);
        if (found) {
            userViolations[socket.id] = (userViolations[socket.id] || 0) + 1;
            msg.content = censored;
            // Notify the user about the warning
            socket.emit('warning', {
                message: `Vulgar language is not allowed! (${userViolations[socket.id]}/3 chances used)`
            });
            if (userViolations[socket.id] >= 3) {
                socket.emit('kicked', { message: 'You have been kicked for repeated use of vulgar language.' });
                socket.disconnect();
                return;
            }
        }
        // Broadcast to all clients including sender
        io.emit('chat message', {
            ...msg,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
        console.log('Message broadcasted to all clients');
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected. Socket ID:', socket.id);
        io.emit('user left', { socketId: socket.id });
    });

    // Handle connection errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('public/uploads')) {
    fs.mkdirSync('public/uploads', { recursive: true });
}

// Start the server
const PORT = process.env.PORT || 8002;
const HOST = '0.0.0.0';  // Listen on all network interfaces
const IPV4_ADDRESS = process.env.IPV4_ADDRESS || '10.1.168.139';  // Your IPv4 address
http.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://${IPV4_ADDRESS}:${PORT}`);
    console.log('To access from other devices on the same network, use:', `http://${IPV4_ADDRESS}:${PORT}`);
}); 