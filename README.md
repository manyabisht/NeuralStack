# NeuralStack — AI-Powered Developer Toolkit

> A full-stack portfolio project demonstrating AI integration, DSA algorithms, and modern React development.

![NeuralStack](https://img.shields.io/badge/Claude-AI%20Powered-7c5cfc?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20AI-00d4aa?style=for-the-badge)
![DSA](https://img.shields.io/badge/DSA-5%20Algorithms-ff6b6b?style=for-the-badge)

---

## What This Project Demonstrates

| Tab | Skill Demonstrated |
|-----|-------------------|
| **AI Code Reviewer** | Anthropic API integration, prompt engineering, REST API design |
| **DSA Visualizer** | Algorithm implementation, async animation, React state management |
| **Complexity Analyzer** | Big-O analysis, AI-assisted output parsing, structured response handling |
| **Fine-tuning Studio** | ML dataset generation, JSONL/Alpaca/ShareGPT formats, file download |

---

## Tech Stack

- **Frontend**: React 18, custom CSS (no component library)
- **Backend**: Node.js + Express, Anthropic SDK
- **AI**: Claude Sonnet (claude-sonnet-4-20250514) via secure server-side proxy
- **Security**: Helmet, CORS, rate limiting — API key never exposed to browser

---

## Project Structure

```
neuralstack/
├── package.json              ← root scripts (runs both client + server)
├── .gitignore
│
├── server/
│   ├── index.js              ← Express API server
│   ├── package.json
│   └── .env.example          ← copy to .env and add your API key
│
└── client/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js            ← root component + tab routing
        ├── App.css           ← all styles
        ├── index.js
        ├── index.css
        ├── api/
        │   └── claude.js     ← all API calls (proxy to server)
        └── components/
            ├── Sidebar.js
            ├── Topbar.js
            ├── CodeReviewer.js
            ├── DSAVisualizer.js
            ├── ComplexityAnalyzer.js
            └── FineTuningStudio.js
```

---

## Local Development Setup

### Prerequisites
- Node.js v18 or higher ([download](https://nodejs.org))
- An Anthropic API key ([get one](https://console.anthropic.com))

### Step 1 — Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/neuralstack.git
cd neuralstack

# Install all dependencies (root + server + client)
npm install
npm run install:all
```

### Step 2 — Set your API key

```bash
cd server
cp .env.example .env
```

Open `server/.env` and replace the placeholder:

```env
ANTHROPIC_API_KEY=sk-ant-your-real-key-here
PORT=3001
CLIENT_ORIGIN=http://localhost:3000
```

### Step 3 — Run the project

From the **root** folder:

```bash
npm run dev
```

This starts both servers concurrently:
- **Backend** → http://localhost:3001
- **Frontend** → http://localhost:3000 (auto-opens in browser)

---

## API Endpoints

All endpoints are on the Express server at `http://localhost:3001`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| POST | `/api/review` | Code review, optimization, or explanation |
| POST | `/api/complexity` | Big-O time & space complexity analysis |
| POST | `/api/explain-algo` | Explain a sorting algorithm |
| POST | `/api/finetune` | Generate fine-tuning training data |
| POST | `/api/claude` | Generic Claude prompt proxy |

### Example request

```bash
curl -X POST http://localhost:3001/api/complexity \
  -H "Content-Type: application/json" \
  -d '{"code": "for(let i=0;i<n;i++) for(let j=0;j<n;j++) sum+=i*j;"}'
```

---

## Deployment

### Option A — Vercel (Frontend) + Railway (Backend) — Recommended

#### Deploy the backend to Railway

1. Go to [railway.app](https://railway.app) and create a free account
2. Click **New Project → Deploy from GitHub repo**
3. Select your repo, then set **Root Directory** to `server`
4. Add environment variable: `ANTHROPIC_API_KEY = sk-ant-...`
5. Railway auto-detects Node.js and runs `npm start`
6. Copy your Railway URL, e.g. `https://neuralstack-server.up.railway.app`

#### Deploy the frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set **Root Directory** to `client`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `build`
5. Add environment variable:
   ```
   REACT_APP_API_URL=https://neuralstack-server.up.railway.app
   ```
6. In `client/src/api/claude.js`, change the BASE line to:
   ```js
   const BASE = process.env.REACT_APP_API_URL || '/api';
   ```
7. Deploy — Vercel gives you a free `.vercel.app` URL

#### Update CORS on the server

In `server/.env` on Railway, also set:
```env
CLIENT_ORIGIN=https://your-app.vercel.app
```

---

### Option B — Single-server deploy (Render / Fly.io)

Build the React app and serve it from Express:

```bash
# 1. Build client
cd client && npm run build

# 2. Add this to server/index.js (before app.listen):
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
```

Then deploy the whole `neuralstack/` folder to [Render](https://render.com):
- **Build Command**: `npm run install:all && npm run build`
- **Start Command**: `npm run start:server`
- **Environment**: `ANTHROPIC_API_KEY=sk-ant-...`

---

### Option C — GitHub Pages (Frontend only)

If you only want to demo the UI without a live backend (uses direct Anthropic API calls from browser — not production-safe but fine for demos):

```bash
cd client
npm install gh-pages --save-dev
```

Add to `client/package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/neuralstack",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

Then:
```bash
npm run deploy
```

> ⚠️ For GitHub Pages only — you'll need to temporarily call the Anthropic API directly from the browser (revert `claude.js` to call `https://api.anthropic.com` directly with a hardcoded key). **Do not commit your API key to GitHub.** Use this only for demo purposes.

---

## Adding to Your Resume

```
NeuralStack — AI-Powered Developer Toolkit        github.com/YOU/neuralstack
Full-stack application combining Claude AI, React, and Node.js/Express
• Built secure Anthropic API proxy with rate limiting, CORS, and Helmet
• Implemented 5 sorting algorithms (Bubble, Insertion, Selection, Merge, Quick)
  with real-time step-by-step animation and live comparison/swap counters
• AI Code Reviewer with quality scoring, Big-O detection, and improvement suggestions
• Fine-tuning Dataset Generator supporting JSONL, Alpaca, and ShareGPT formats
• Complexity Analyzer with structured AI output parsing and optimization tips
```

---

## Extending the Project (Ideas for Interview)

- **Add a backend database** (MongoDB) to save code review history
- **Add user auth** (JWT) so users can have personal review history
- **Graph visualizer** — BFS/DFS with animated node traversal
- **Streaming responses** — use Claude's streaming API for typewriter output
- **Multiple AI providers** — abstract the AI layer to support OpenAI + Anthropic
- **Export as PDF** — generate a downloadable code review report

---

## Common Issues

**"Too many requests" error**
- The server rate-limits to 50 requests per 15 minutes per IP. Wait and retry.

**CORS error in browser**
- Make sure `CLIENT_ORIGIN` in `server/.env` matches exactly what your browser shows.

**API key not working**
- Confirm the key starts with `sk-ant-` and is from [console.anthropic.com](https://console.anthropic.com)
- Check `server/.env` is not committed to git (it's in `.gitignore`)

**Port already in use**
- Change `PORT=3001` in `server/.env` or kill the process using that port:
  ```bash
  lsof -ti:3001 | xargs kill
  ```

---

## License

MIT — free to use, modify, and present in interviews.
