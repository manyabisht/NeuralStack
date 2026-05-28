// All API calls proxy through our Express backend — API key stays server-side.

const BASE = '/api';

async function post(endpoint, body) {
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

export async function reviewCode(code, language, mode) {
  const { text } = await post('/review', { code, language, mode });
  return text;
}

export async function analyzeComplexity(code) {
  const { text } = await post('/complexity', { code });
  return text;
}

export async function explainAlgorithm(algorithm) {
  const { text } = await post('/explain-algo', { algorithm });
  return text;
}

export async function generateFineTuneData(domain, count, format) {
  const { text } = await post('/finetune', { domain, count, format });
  return text;
}

export async function callClaude(prompt, system) {
  const { text } = await post('/claude', { prompt, system });
  return text;
}
