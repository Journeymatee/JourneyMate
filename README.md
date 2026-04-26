# JourneyMate - AI Travel Planning Platform

JourneyMate is a full-stack travel platform for Indian travelers. It compares budget vs luxury trips, generates travel guidance, and now includes an advanced AI assistant with streaming chat, voice input/output, and persistent memory.

## Core Features

- Smart trip comparison: budget (Silver) vs premium (Gold) travel plans.
- Route-based planning across major Indian destinations with practical itinerary guidance.
- Professional, responsive UI for desktop, tablet, and mobile.
- Authentication system:
  - email/password login and registration
  - Google login
  - forgot-password reset flow
- Platform branding pages:
  - About/Platform Owner page
  - policy, terms, pricing, blog, contact, and routes pages
- Dynamic page theming and custom visual design for content sections.
- AI chatbot assistant:
  - LLM-powered responses with NLP intent/entity extraction
  - token streaming responses (live typing effect)
  - follow-up suggestion chips
  - voice input via microphone
  - voice output (AI speaks responses)
  - Hindi/English auto-switch for speech
  - persistent per-user conversation memory in PostgreSQL
- Production-ready backend setup with migration + seed on boot.

## AI Assistant Capabilities

JourneyMate AI combines LLM reasoning with lightweight rule-based NLP:

- Intent detection: itinerary, comparison, budget, seasonality, transport, safety, general queries.
- Entity extraction: source city, destination city, days, budget, month, known city mentions.
- Context-aware prompting with user profile + extracted entities.
- Graceful fallback engine if external LLM is unavailable.
- Server-sent events (SSE) stream API for progressive responses.
- Conversation memory table (`ai_chat_messages`) for user-specific continuity.

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, express-validator, rate limiting
- Database: PostgreSQL
- Auth: JWT-style bearer token flow + Google identity support
- AI: OpenAI-compatible chat completions API + NLP augmentation

## Monorepo Structure

```text
travel-app/
  backend/      # Node/Express API + schema + seed/migrate scripts
  frontend/     # React/Vite client
  photos/       # source image assets used in UI
```

## Local Setup

### Prerequisites

- Node.js 20+
- Docker Desktop (recommended for clean local PostgreSQL)

### 1) Database (Docker PostgreSQL)

Start PostgreSQL container:

```bash
docker compose up -d postgres
```

Check health/logs:

```bash
docker compose ps
docker compose logs -f postgres
```

Stop container:

```bash
docker compose down
```

Reset DB data (fresh clean DB):

```bash
docker compose down -v
docker compose up -d postgres
```

### 2) Backend

```bash
cd backend
npm install
npm run dev
```

The backend `.env` is already configured for Docker DB:

- `PGHOST=localhost`
- `PGPORT=5433`
- `PGDATABASE=journeymate`
- `PGUSER=postgres`
- `PGPASSWORD=journeymate123`

Backend health check:

```text
http://localhost:8080/api/health
```

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Environment Variables

### Backend (`backend/.env`)

- `NODE_ENV=development`
- `PORT=8080`
- `DATABASE_URL=...` (preferred in cloud) or `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD`
- `AUTH_SECRET=...`
- `TOKEN_TTL_MS=...`
- `CORS_ORIGIN=http://localhost:5173,...`
- `GOOGLE_CLIENT_ID=...` (optional)
- `GOOGLE_CLIENT_SECRET=...` (optional)
- `AI_API_KEY=...`
- `AI_MODEL=gpt-4o-mini`
- `AI_API_URL=https://api.openai.com/v1/chat/completions`
- `AI_TIMEOUT_MS=20000`
- `AI_REALTIME_ENABLED=true`
- `AI_LIVE_TIMEOUT_MS=8000`
- `SEED_ON_BOOT=true`
- `TRUST_PROXY=true`

### AI model providers (incl. free-tier options)

This project uses an **OpenAI Chat Completions compatible** `POST` request to `AI_API_URL` with a bearer token. That means you can point it to any compatible provider, not only OpenAI.

- **OpenAI (paid/usage)**: set `AI_API_URL` to `https://api.openai.com/v1/chat/completions` and an OpenAI key.
- **Groq (common free-credit / fast)**: set `AI_API_URL` to `https://api.groq.com/openai/v1/chat/completions` and a Groq API key, pick a model like `llama-3.1-8b-instant`.
- **Together (sometimes free credits)**: set their OpenAI-compatible chat completions URL + key.
- **Local Ollama (dev only)**: run Ollama with an OpenAI-compatible server and point `AI_API_URL` to that host (often not suitable for a public website unless you also host a dedicated inference server).

Copy `backend/.env.example` to `backend/.env` locally, then set keys in **Render** for production. Do not commit real secrets.

### Frontend (`frontend/.env` / Render static env)

- `VITE_API_URL=https://<your-api-host>/api`

Important: `VITE_API_URL` must include `/api` at the end.

## API Overview

Base URL:

```text
/api
```

Key route groups:

- `/auth` - login, register, google auth, forgot-password, me, stats
- `/trips` - trip comparison/search flow
- `/cities` - city lookup data
- `/bookings` - booking-related operations
- `/ai/chat` - normal AI response
- `/ai/chat/stream` - streamed AI response (SSE)
- `/health` - service/database health check

## Deploy on Render (Recommended)

Create resources in this order:

1. PostgreSQL
2. Backend Web Service (`backend`)
3. Frontend Static Site (`frontend`)

### Backend (Render Web Service)

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health path: `/api/health`
- Env vars: `DATABASE_URL`, `AUTH_SECRET`, `CORS_ORIGIN`, `AI_API_KEY`, `AI_MODEL`, `VITE/Google vars as needed`

### Frontend (Render Static Site)

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Env var: `VITE_API_URL=https://<api-service>.onrender.com/api`
- Add SPA rewrite:
  - Source: `/*`
  - Destination: `/index.html`
  - Action: Rewrite

### Render Deployment Checklist

- API health endpoint returns success.
- Frontend points to correct API host (`VITE_API_URL`).
- Backend `CORS_ORIGIN` includes frontend domain.
- AI key configured in backend environment.
- Frontend and backend redeployed after env updates.

## Security Notes

- Do not commit production secrets to Git.
- Keep `AI_API_KEY`, DB credentials, and auth secret in Render environment variables.
- If any key is exposed, rotate it immediately.

## License

Private project by Harsh Vardhan Kumar.
