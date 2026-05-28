require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      process.env.CLIENT_ORIGIN,
      'http://localhost:3000',
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'GET'],
}));
app.use(express.json({ limit: '50kb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests, please try again after 15 minutes.' },
});
app.use('/api/', limiter);

// ─── Groq Helper ──────────────────────────────────────────────────────────────
async function askGroq(systemPrompt, userPrompt, maxTokens = 1024) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set in environment variables.');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.message || `Groq API error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from Groq.');
  return text;
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    model: 'llama-3.1-8b-instant (Groq)',
    timestamp: new Date().toISOString(),
  });
});

// ─── Generic Proxy ────────────────────────────────────────────────────────────
app.post('/api/claude', async (req, res) => {
  const { prompt, system, max_tokens } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required and must be a string.' });
  }
  try {
    const text = await askGroq(
      system || 'You are an expert software engineer and AI researcher. Be concise and technical.',
      prompt,
      max_tokens || 1024
    );
    res.json({ text });
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Code Review ──────────────────────────────────────────────────────────────
app.post('/api/review', async (req, res) => {
  const { code, language, mode } = req.body;
  if (!code || !language || !mode) {
    return res.status(400).json({ error: 'code, language, and mode are required.' });
  }

  const prompts = {
    review: `Review this ${language} code. Give:
1) Quality score /100
2) Issues found (count)
3) Time complexity in Big-O
4) 3-4 specific issues

Format first line exactly as: SCORE:XX | COMPLEXITY:O(...) | ISSUES:N

Then bullet-point the issues.

Code:
\`\`\`${language}
${code}
\`\`\``,
    optimize: `Optimize this ${language} code. Show the improved version and explain what changed. Be concise.

Code:
\`\`\`${language}
${code}
\`\`\``,
    explain: `Explain this ${language} code step by step in simple terms. Mention the algorithm/pattern used.

Code:
\`\`\`${language}
${code}
\`\`\``,
  };

  if (!prompts[mode]) return res.status(400).json({ error: 'Invalid mode.' });

  try {
    const text = await askGroq(
      'You are a senior software engineer specializing in code review and DSA. Be concise, precise, and technical.',
      prompts[mode],
      1024
    );
    res.json({ text });
  } catch (err) {
    console.error('Review error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Complexity Analysis ──────────────────────────────────────────────────────
app.post('/api/complexity', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'code is required.' });

  try {
    const text = await askGroq(
      'You are a DSA expert. Give precise Big-O analysis.',
      `Analyze the time and space complexity of this code. Format exactly:
TIME: O(...)
SPACE: O(...)
LOOP DEPTH: N
EXPLANATION: 2-3 sentences
OPTIMIZATION: One key suggestion

Code:
${code}`,
      512
    );
    res.json({ text });
  } catch (err) {
    console.error('Complexity error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Algorithm Explanation ────────────────────────────────────────────────────
app.post('/api/explain-algo', async (req, res) => {
  const { algorithm } = req.body;
  if (!algorithm) return res.status(400).json({ error: 'algorithm is required.' });

  try {
    const text = await askGroq(
      'You are a CS professor explaining algorithms. Be clear and concise.',
      `Explain ${algorithm} in 3-4 sentences. Include: when to use it, its key trade-off vs other sorts. Be concise.`,
      256
    );
    res.json({ text });
  } catch (err) {
    console.error('Explain-algo error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Fine-tuning Dataset Generator ───────────────────────────────────────────
app.post('/api/finetune', async (req, res) => {
  const { domain, count, format } = req.body;
  if (!domain || !count || !format) {
    return res.status(400).json({ error: 'domain, count, and format are required.' });
  }

  const formatGuide = {
    jsonl:    'JSONL format: {"messages":[{"role":"system","content":"..."},{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}',
    alpaca:   'Alpaca format: {"instruction":"...","input":"...","output":"..."}',
    sharegpt: 'ShareGPT format: {"conversations":[{"from":"human","value":"..."},{"from":"gpt","value":"..."}]}',
  };

  if (!formatGuide[format]) return res.status(400).json({ error: 'Invalid format.' });

  try {
    const text = await askGroq(
      'You are a machine learning engineer creating fine-tuning datasets. Output only valid JSON, one per line. No markdown, no preamble.',
      `Generate ${count} high-quality fine-tuning training examples for: "${domain}". Use ${formatGuide[format]}. Each example on a new line. Make them diverse and realistic. Only output the JSON lines, nothing else.`,
      1500
    );
    res.json({ text });
  } catch (err) {
    console.error('Finetune error:', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 NeuralStack server running on http://localhost:${PORT}`);
  console.log(`   Groq API Key: ${process.env.GROQ_API_KEY ? '✅ Loaded' : '❌ Missing — set GROQ_API_KEY in .env'}\n`);
});