const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname);
const CHAIN_FILE = path.join(DATA_DIR, 'chain.json');

function ensureChainFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  let needsInit = !fs.existsSync(CHAIN_FILE);
  if (!needsInit) {
    try {
      const data = JSON.parse(fs.readFileSync(CHAIN_FILE, 'utf8'));
      needsInit = !Array.isArray(data) || data.length === 0 || data[0].index !== 0 || typeof data[0].hash !== 'string';
    } catch {
      needsInit = true;
    }
  }
  if (needsInit) {
    const genesis = createBlock(0, '0'.repeat(64), { meta: { type: 'GENESIS' } });
    fs.writeFileSync(CHAIN_FILE, JSON.stringify([genesis], null, 2));
  }
}

function readChain() {
  ensureChainFile();
  const raw = fs.readFileSync(CHAIN_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeChain(chain) {
  fs.writeFileSync(CHAIN_FILE, JSON.stringify(chain, null, 2));
}

function hashBlock({ index, timestamp, data, prevHash, nonce }) {
  const payload = JSON.stringify({ index, timestamp, data, prevHash, nonce });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function mine({ index, timestamp, data, prevHash }, difficulty = 3, maxIters = 100000) {
  let nonce = 0;
  const target = '0'.repeat(difficulty);
  while (nonce < maxIters) {
    const hash = hashBlock({ index, timestamp, data, prevHash, nonce });
    if (hash.startsWith(target)) return { nonce, hash };
    nonce++;
  }
  // Fallback without PoW if not found quickly (keeps it snappy offline)
  const hash = hashBlock({ index, timestamp, data, prevHash, nonce: 0 });
  return { nonce: 0, hash };
}

function createBlock(index, prevHash, data) {
  const timestamp = new Date().toISOString();
  const { nonce, hash } = mine({ index, timestamp, data, prevHash });
  return { index, timestamp, data, prevHash, nonce, hash };
}

function getChain() { return readChain(); }

function getLatest() { const c = readChain(); return c[c.length - 1]; }

function addBlock(data) {
  const chain = readChain();
  const latest = chain[chain.length - 1];
  const block = createBlock(latest.index + 1, latest.hash, data);
  chain.push(block);
  writeChain(chain);
  return block;
}

function getBlockByHash(h) {
  const chain = readChain();
  return chain.find(b => b.hash === h);
}

function verifyChain() {
  const chain = readChain();
  for (let i = 1; i < chain.length; i++) {
    const prev = chain[i - 1];
    const curr = chain[i];
    if (curr.prevHash !== prev.hash) {
      return { ok: false, error: `Broken link at index ${i}`, length: chain.length };
    }
    const recomputed = hashBlock({
      index: curr.index,
      timestamp: curr.timestamp,
      data: curr.data,
      prevHash: curr.prevHash,
      nonce: curr.nonce,
    });
    if (recomputed !== curr.hash) {
      return { ok: false, error: `Hash mismatch at index ${i}` , length: chain.length };
    }
  }
  return { ok: true, length: chain.length };
}

module.exports = {
  addBlock,
  getChain,
  getBlockByHash,
  verifyChain,
};
