# SiteAmplify

SEO + KI Visibility Booster für Oberbeck Marketing.

## Aktueller Stack

- **Frontend:** Next.js 14 + Tailwind CSS
- **Backend:** Express + SQLite
- **Crawler:** Puppeteer + Cheerio
- **AI:** OpenAI API mit Fallback-Modus ohne Key
- **Deployment:** Netlify (Frontend) + Railway (Backend empfohlen)

## Status

- Frontend ist gebaut und kann auf Netlify laufen
- Backend ist für Railway vorbereitet
- SQLite wird lokal oder über ein gemountetes Railway-Volume genutzt

## Struktur

- `frontend/` – Next.js App
- `backend/` – Express API
- `CONCEPT.md` – Produktidee
- `TECH-SPEC.md` – technische Spezifikation
- `railway.json` – Railway Deploy-Konfiguration

## Backend lokal starten

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Healthcheck:

```bash
http://localhost:3001/health
```

## Railway Deployment

Benötigte Env Vars im Backend-Service:

- `NODE_ENV=production`
- `PORT=3001` (Railway überschreibt oft selbst)
- `FRONTEND_URL=https://siteamplify.netlify.app`
- `DATABASE_URL=/data/siteamplify.db`
- `JWT_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- optional `OPENAI_API_KEY=...`
- optional Stripe-Variablen

Empfehlung:
- Railway Volume mounten und auf `/data` legen
- Repo-Root deployen, `railway.json` nutzt `backend/Dockerfile`

## Frontend

`frontend/.env.production`

```bash
NEXT_PUBLIC_API_URL=https://<deine-railway-domain>
```
