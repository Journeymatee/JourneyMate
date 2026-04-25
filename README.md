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
| Frontend | e.g. Vercel — root **frontend**, set env vars below, then redeploy |
| Backend | e.g. Vercel (`backend`), Railway, Render — `DATABASE_URL`, `AUTH_SECRET`, `CORS_ORIGIN`, etc. |
| Database | Neon, Supabase, RDS — connection string in `DATABASE_URL` or `PG*` vars |

### Vercel frontend — fix “Network Error”

The SPA is static; **`/api` on the same domain is not your Node server** unless you add a separate rewrite. By default the UI must call your API by **full URL**.

1. Deploy the **backend** and copy its public base (e.g. `https://journeymate-api.vercel.app`).
2. In the **frontend** Vercel project → **Settings → Environment Variables** (Production):
   - **`VITE_API_URL`** = `https://<your-api-host>/api`  
     (must end with **`/api`** — Express mounts routes under `/api`.)
3. **Redeploy** the frontend (env is baked in at build time).
4. On the **backend**, set **`CORS_ORIGIN`** to your live frontend origin, e.g. `https://your-app.vercel.app` (comma-separated for several). Using `*` works but is loose; prefer the real UI URL with credentials if you tighten CORS later.

See `frontend/.env.example`.

---

## Deploy on Render.com

Use **one Git repo** (`007Harshvardhan/JourneyMate`). Create resources in this order: **PostgreSQL → Web Service (API) → Static Site (UI)**.

### 1. PostgreSQL (Render)

1. Dashboard → **New +** → **PostgreSQL**.
2. Name: e.g. `journeymate-db`, region (match API below), plan as needed.
3. After it is **Available**, open the DB → copy **Internal Database URL** (preferred if API is on Render in the same region) or **External Database URL**.

You do **not** need to create `journeymate` manually: the URL Render gives already includes a database name — use that URL as **`DATABASE_URL`** on the API.

---

### 2. Web Service — Node API (`backend`)

| Field | Value |
|--------|--------|
| **Name** | `journeymate-api` (becomes `https://journeymate-api.onrender.com`) |
| **Project** | Optional — create a project if you want grouping |
| **Language** | **Node** |
| **Branch** | `main` |
| **Region** | Same as Postgres (e.g. **Oregon** or **Singapore**) |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |

**Environment → Environment Variables** (add manually or **Link database** so `DATABASE_URL` is injected):

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Paste from Render Postgres (**Link** the DB to auto-fill), or Neon/Supabase URL |
| `AUTH_SECRET` | Long random string (e.g. 32+ chars); used to sign session tokens |
| `CORS_ORIGIN` | Your **frontend** URL after step 3, e.g. `https://journeymate-web.onrender.com` (comma-separated for multiple). For a quick test you can use `*` |
| `GOOGLE_CLIENT_ID` | Optional — same value as local if you use Google Sign-In |
| `SEED_ON_BOOT` | `true` (seeds demo users + cities on deploy) |
| `TRUST_PROXY` | `true` |

Render sets **`PORT`** automatically — the app already reads `process.env.PORT`.

Deploy the API, wait until it is **Live**, then open `https://<your-api-name>.onrender.com/api/health` — JSON should show `"ok": true` and `"database": true`.

---

### 3. Static Site — Vite frontend (`frontend`)

| Field | Value |
|--------|--------|
| **Name** | `journeymate-web` (or any name; URL becomes `https://<name>.onrender.com`) |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish directory** | `dist` |

**Environment → Environment Variables** (needed at **build** time):

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://<your-api-name>.onrender.com/api` — **exact** URL of step 2, must end with `/api` |

**SPA routing (React Router):** In the static site on Render, add a **Rewrite** (Redirects / Rewrites section, names vary):

- **Source:** `/*`
- **Destination:** `/index.html`
- **Action:** Rewrite (not redirect)

If direct links to routes 404 without this, that rule is missing.

Redeploy the static site after changing `VITE_API_URL`.

---

### 4. Wire CORS

After the static site URL is known, set **`CORS_ORIGIN`** on the **Web Service** to that origin (e.g. `https://journeymate-web.onrender.com`) and **clear redeploy** the API so the browser is allowed to call the API with cookies/headers you use.

---

### Checklist

- [ ] Postgres running; `DATABASE_URL` on API
- [ ] API `/api/health` returns 200 with `database: true`
- [ ] `VITE_API_URL` on static site = `https://<api>.onrender.com/api` + rebuild
- [ ] `CORS_ORIGIN` on API = `https://<web>.onrender.com`
- [ ] SPA rewrite `/*` → `/index.html` on static site

---

## Tech stack

**Frontend:** React 18 · Vite · Tailwind CSS  
**Backend:** Node.js · Express · `pg`  
**Database:** PostgreSQL  

---

## Demo login (after seed)

If `SEED_ON_BOOT` seeds users: `demo@journeymate.app` / `demo123` (see `backend/src/scripts/seed.js`).
