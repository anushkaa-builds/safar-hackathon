# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## 🤖 AI Guardian & Real-Time Travel Copilot

The platform features an integrated, real-time AI Travel Assistant powered by OpenAI and a local Hybrid RAG (Retrieval-Augmented Generation) pipeline over the site's destination catalogs, reviews, and monitoring feeds.

### Features:
- **Streaming Completions (SSE)**: Delivers token-by-token replies progressively for a natural conversational experience.
- **Hybrid Knowledge Retrieval (RAG)**: Chunks and searches the site's destination knowledge base (attractions, offbeat gems, stays, transit, emergency contacts, and real traveler reviews) using cosine vector similarity + lexical scoring.
- **Dynamic Context Injection**: Passes real-time monitoring alerts (crowd bottlenecks, weather advisories) and active trip itineraries into the model before generating responses.
- **Resilient Fallback**: Gracefully operates even without an API key or when offline, ensuring the user experience never breaks.
- **Secure Architecture**: The OpenAI API key is kept strictly on the Node backend (`.env`) and never exposed to the frontend.

### Getting Started:

1. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and add your OpenAI API key:
   ```env
   PORT=5001
   OPENAI_API_KEY=sk-proj-...
   OPENAI_MODEL=gpt-4o-mini
   EMBEDDING_MODEL=text-embedding-3-small
   ```

2. **Index / Update Site Knowledge Base**:
   ```bash
   npm run index-data
   ```

3. **Run Both Frontend and AI Backend Server**:
   ```bash
   npm run dev:all
   ```
   Or run them in separate terminals:
   - Frontend: `npm run dev` (Vite on `http://localhost:5173`)
   - AI Backend: `npm run server` (Express on `http://localhost:5001`)

