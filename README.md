# JourneyMate — Silver vs Gold travel comparison

Full-stack app: **React 18 + Vite** frontend, **Node.js + Express** API, **PostgreSQL** data.

---

## Features

| Feature | Details |
|--------|---------|
| Compare | Silver vs Gold plans side-by-side |
| Toggle | Optimize for savings / balance / comfort |
| Itinerary | Day-by-day plans where applicable |
| Responsive | Mobile-first layout |

---

## Quick start (local)

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 14+ (local install, cloud, or Postgres.app)

### 1. Database

Create a database (name can match `PGDATABASE` in `.env`, default `journeymate`):

```bash
psql -U postgres -c "CREATE DATABASE journeymate;"
```

### 2. Backend

```bash
cd backend
# Add .env with PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE (or DATABASE_URL)
npm install
npm run dev
```

API: `http://localhost:8080` (or `PORT` from `.env`) — e.g. `http://localhost:8080/api/health`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173` (Vite proxies `/api` to the backend in dev when configured).

---

## Architecture (overview)

```
travel-app/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Express API, migrations under src/schema
└── README.md
```

---

## Cloud deployment

| Layer | Notes |
|-------|--------|
| Frontend | e.g. Vercel — build `frontend`, set `VITE_API_URL` to your API base URL |
| Backend | e.g. Railway, Render, Vercel serverless — set `DATABASE_URL`, `AUTH_SECRET`, etc. |
| Database | Neon, Supabase, RDS — connection string in `DATABASE_URL` or `PG*` vars |

---

## Tech stack

**Frontend:** React 18 · Vite · Tailwind CSS  
**Backend:** Node.js · Express · `pg`  
**Database:** PostgreSQL  

---

## Demo login (after seed)

If `SEED_ON_BOOT` seeds users: `demo@journeymate.app` / `demo123` (see `backend/src/scripts/seed.js`).
