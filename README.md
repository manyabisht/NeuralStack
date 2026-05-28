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



## Extending the Project 

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


