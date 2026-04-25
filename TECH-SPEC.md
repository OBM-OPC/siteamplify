# SEO + KI Visibility Booster — Technische Spezifikation

## 1. System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vercel)                      │
│  React 19 + Tailwind CSS + Shadcn/ui + TanStack Query      │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS / JSON
┌────────────────────▼────────────────────────────────────────┐
│                     API Gateway (Railway)                    │
│              Express.js + Rate Limiting + Auth              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        ▼            ▼            ▼            ▼
┌───────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│  Crawler  │ │  SERP    │ │  OpenAI  │ │  User    │
│  Service  │ │  Service │ │  Service │ │  Service │
│ (Puppeteer│ │(DataForSEO│ │ (GPT-4o) │ │(DB/Auth) │
│ /Cheerio) │ │   API)   │ │          │ │          │
└─────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘
      │            │            │            │
      └────────────┴────────────┴────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌───────────────┐      ┌─────────────────┐
│  PostgreSQL   │      │     Redis       │
│  (User Data,  │      │  (Crawl Cache,  │
│   Reports)    │      │   Job Queue)    │
└───────────────┘      └─────────────────┘
```

---

## 2. Datenmodell

### 2.1 Users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255),
    plan            VARCHAR(20) DEFAULT 'free', -- free, pro, agency, enterprise
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    analyses_used   INTEGER DEFAULT 0,
    analyses_limit  INTEGER DEFAULT 1, -- free: 1, pro: 20, agency: 100
    briefs_used     INTEGER DEFAULT 0,
    briefs_limit    INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Analyses (Crawl-Ergebnisse)
```sql
CREATE TABLE analyses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    url             TEXT NOT NULL,
    domain          VARCHAR(255) NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending', -- pending, crawling, analyzing, completed, failed
    
    -- On-Page SEO
    page_title      VARCHAR(255),
    meta_description TEXT,
    h1_count        INTEGER,
    h2_count        INTEGER,
    h3_count        INTEGER,
    word_count      INTEGER,
    image_count     INTEGER,
    images_without_alt INTEGER,
    internal_links  INTEGER,
    external_links  INTEGER,
    has_schema      BOOLEAN DEFAULT FALSE,
    schema_types    JSONB, -- ["Organization", "FAQPage", ...]
    
    -- Scores
    seo_score       INTEGER, -- 0-100
    ki_score        INTEGER, -- 0-100
    content_score   INTEGER, -- 0-100
    technical_score INTEGER, -- 0-100
    
    -- Raw Data
    raw_html_hash   VARCHAR(64), -- SHA256 für Cache-Invalidierung
    raw_data        JSONB, -- vollständiger Crawl
    
    created_at      TIMESTAMP DEFAULT NOW(),
    completed_at    TIMESTAMP
);
```

### 2.3 CompetitorData (SERP-Analyse)
```sql
CREATE TABLE competitor_data (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id     UUID REFERENCES analyses(id),
    keyword         VARCHAR(255) NOT NULL,
    position        INTEGER,
    competitor_url  TEXT NOT NULL,
    competitor_title VARCHAR(255),
    competitor_meta  TEXT,
    competitor_word_count INTEGER,
    topics_covered  JSONB, -- ["topic1", "topic2"]
    created_at      TIMESTAMP DEFAULT NOW()
);
```

### 2.4 PageSuggestions (Unterseiten-Vorschläge)
```sql
CREATE TABLE page_suggestions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id     UUID REFERENCES analyses(id),
    
    -- Vorschlag
    suggested_url_path VARCHAR(255), -- z.B. "/blog/seo-tipps-2026"
    title           VARCHAR(255),
    description     TEXT,
    
    -- Keywords
    primary_keyword VARCHAR(255),
    secondary_keywords JSONB, -- ["keyword1", "keyword2"]
    search_volume   INTEGER, -- geschätzt
    difficulty      INTEGER, -- 0-100
    
    -- Priorisierung
    traffic_potential INTEGER, -- geschätzte Klicks/Monat
    effort_score    INTEGER, -- 1-5 (1 = wenig Aufwand)
    priority_score  INTEGER, -- berechnet: traffic_potential / effort
    
    -- Status
    status          VARCHAR(20) DEFAULT 'suggested', -- suggested, brief_created, content_generated, exported
    
    created_at      TIMESTAMP DEFAULT NOW()
);
```

### 2.5 ContentBriefs
```sql
CREATE TABLE content_briefs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id   UUID REFERENCES page_suggestions(id),
    analysis_id     UUID REFERENCES analyses(id),
    
    -- Brief-Inhalt
    target_audience VARCHAR(255),
    tone_of_voice   VARCHAR(50), -- professionell, locker, technisch, etc.
    word_count_target INTEGER,
    
    -- Struktur
    outline         JSONB, -- [{"h2": "Einleitung", "h3s": [...]}, ...]
    key_points      JSONB, -- ["Punkt 1", "Punkt 2"]
    
    -- SEO
    title_suggestion VARCHAR(255),
    meta_description_suggestion TEXT,
    internal_link_suggestions JSONB, -- [{"anchor": "...", "target": "/..."}]
    
    -- Generierter Content
    generated_content TEXT, -- Markdown
    generated_title   VARCHAR(255),
    generated_meta    TEXT,
    generated_schema  JSONB, -- FAQ-Schema, HowTo-Schema, etc.
    
    created_at      TIMESTAMP DEFAULT NOW(),
    generated_at    TIMESTAMP
);
```

### 2.6 Jobs (für Async-Verarbeitung)
```sql
CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(50) NOT NULL, -- crawl, analyze, generate_brief, generate_content
    status          VARCHAR(20) DEFAULT 'queued', -- queued, processing, completed, failed
    payload         JSONB NOT NULL,
    result          JSONB,
    error_message   TEXT,
    retry_count     INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP
);
```

---

## 3. API-Endpunkte

### 3.1 Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
```

### 3.2 Analyse
```
POST   /api/analyses              # Neue Analyse starten
GET    /api/analyses              # Liste eigener Analysen
GET    /api/analyses/:id          # Einzelne Analyse abrufen
GET    /api/analyses/:id/status   # Status prüfen (Polling/SSE)
DELETE /api/analyses/:id          # Analyse löschen
```

**POST /api/analyses Request:**
```json
{
  "url": "https://example.com",
  "options": {
    "include_competitors": true,
    "competitor_count": 3,
    "check_ki_readiness": true
  }
}
```

**Response (202 Accepted):**
```json
{
  "analysis_id": "uuid",
  "job_id": "uuid",
  "status": "queued",
  "estimated_seconds": 60
}
```

### 3.3 Vorschläge
```
GET    /api/analyses/:id/suggestions          # Alle Vorschläge
GET    /api/analyses/:id/suggestions/:suggestion_id
POST   /api/analyses/:id/suggestions/:id/brief  # Brief generieren
```

### 3.4 Content-Briefs
```
GET    /api/briefs/:id
POST   /api/briefs/:id/generate-content       # Text generieren
GET    /api/briefs/:id/export?format=markdown|html|wp
```

### 3.5 User / Billing
```
GET    /api/user/profile
GET    /api/user/usage
POST   /api/user/upgrade                        # Stripe Checkout
GET    /api/user/subscription
```

---

## 4. Services

### 4.1 Crawler Service

**Aufgabe:** Ruft Website ab, parsed HTML, extrahiert SEO-Daten.

**Implementation:**
```javascript
// crawler.service.js
class CrawlerService {
  async crawl(url) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const data = await page.evaluate(() => {
      return {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content,
        h1s: [...document.querySelectorAll('h1')].map(h => h.textContent),
        h2s: [...document.querySelectorAll('h2')].map(h => h.textContent),
        // ... etc
      };
    });
    
    await browser.close();
    return data;
  }
}
```

**Cache-Strategie:**
- Redis-Cache: HTML + geparste Daten für 24h
- Hash-basiert: SHA256(URL + Accept-Language)

### 4.2 SERP Service (DataForSEO)

**Aufgabe:** Ruft SERP-Daten für Hauptkeyword ab.

```javascript
// serp.service.js
class SERPService {
  async getCompetitors(keyword, location = 'de', language = 'de') {
    const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        keyword,
        location_code: location === 'de' ? 2756 : 2840,
        language_code: language,
        device: 'desktop',
        os: 'windows'
      }])
    });
    
    return response.json();
  }
}
```

### 4.3 AI Service (OpenAI)

**Aufgabe:** Generiert Content-Briefs und Texte.

```javascript
// ai.service.js
class AIService {
  async generateBrief(crawlData, competitorData, suggestion) {
    const prompt = `
Du bist ein SEO-Experte. Erstelle einen Content-Brief für eine Unterseite.

Website: ${crawlData.url}
Hauptthema: ${suggestion.primary_keyword}
Zielgruppe: ${this.inferAudience(crawlData.url)}

Kontext der bestehenden Website:
- Aktuelle Seiten: ${crawlData.pages?.join(', ')}
- Branche: ${crawlData.industry}

Konkurrenten-Topik (werden abgedeckt):
${competitorData.map(c => `- ${c.title}: ${c.topics_covered?.join(', ')}`).join('\n')}

Erstelle einen Content-Brief mit:
1. Zielgruppe
2. Tonality
3. Wortanzahl-Ziel
4. Detaillierte Outline (H2, H3)
5. Key Points pro Abschnitt
6. Interne Link-Vorschläge
7. Title-Tag Vorschlag (max. 60 Zeichen)
8. Meta-Description Vorschlag (max. 160 Zeichen)

Antworte als JSON.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });
    
    return JSON.parse(response.choices[0].message.content);
  }
  
  async generateContent(brief) {
    // Ähnlicher Prompt für vollständigen Text
  }
}
```

### 4.4 Analysis Service

**Aufgabe:** Orchestriert den gesamten Analyse-Flow.

```javascript
// analysis.service.js
class AnalysisService {
  async runAnalysis(analysisId) {
    const analysis = await db.analyses.findById(analysisId);
    
    // Step 1: Crawl
    await this.updateStatus(analysisId, 'crawling');
    const crawlData = await crawlerService.crawl(analysis.url);
    
    // Step 2: SERP + Competitors
    await this.updateStatus(analysisId, 'analyzing');
    const mainKeyword = this.extractMainKeyword(crawlData);
    const serpData = await serpService.getCompetitors(mainKeyword);
    
    // Step 3: Content Gap Analysis
    const gaps = await this.findContentGaps(crawlData, serpData);
    
    // Step 4: Scores berechnen
    const scores = this.calculateScores(crawlData, gaps);
    
    // Step 5: Vorschläge generieren
    const suggestions = await this.generateSuggestions(analysisId, gaps);
    
    // Step 6: Speichern
    await db.analyses.update(analysisId, {
      ...scores,
      raw_data: crawlData,
      status: 'completed',
      completed_at: new Date()
    });
    
    return { analysisId, suggestions: suggestions.length };
  }
}
```

---

## 5. Async Job Queue (BullMQ + Redis)

```javascript
// queue.js
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL);

// Queues
export const crawlQueue = new Queue('crawl', { connection });
export const analyzeQueue = new Queue('analyze', { connection });
export const briefQueue = new Queue('brief', { connection });

// Worker
const crawlWorker = new Worker('crawl', async (job) => {
  const { analysisId, url } = job.data;
  return crawlerService.crawl(url);
}, { connection, concurrency: 3 });

// SSE für Frontend-Updates
export async function sendProgress(jobId, progress) {
  // Publish to Redis pub/sub → Frontend SSE
}
```

---

## 6. Frontend-Komponenten

### 6.1 Seiten-Struktur

```
/
├── /                      # Landing Page
├── /login                 # Auth
├── /dashboard             # Übersicht Analysen
├── /analyze               # Neue Analyse
├── /analysis/[id]         # Ergebnis-Dashboard
│   ├── /overview          # Score + Probleme
│   ├── /suggestions       # Unterseiten-Vorschläge
│   └── /competitors       # Wettbewerbsdaten
├── /brief/[id]            # Content-Brief Editor
├── /settings              # Account + Billing
└── /admin                 # (nur Agency/Enterprise)
```

### 6.2 Key Components

```typescript
// components/analysis/ScoreCard.tsx
interface ScoreCardProps {
  seoScore: number;
  kiScore: number;
  contentScore: number;
  technicalScore: number;
}

// components/analysis/SuggestionTable.tsx
interface SuggestionTableProps {
  suggestions: PageSuggestion[];
  onGenerateBrief: (id: string) => void;
  onExport: (id: string, format: string) => void;
}

// components/brief/ContentBrief.tsx
interface ContentBriefProps {
  brief: ContentBrief;
  onGenerateText: () => void;
  onRegenerate: () => void;
}
```

---

## 7. Authentifizierung & Autorisierung

### 7.1 Auth-Flow
```
1. User registriert / loggt ein
2. JWT-Token (Access: 15min, Refresh: 7 Tage)
3. Middleware prüft Token + Plan-Limit
```

### 7.2 Rate Limiting

| Plan       | Analysen/Monat | Requests/Min |
|------------|----------------|--------------|
| Free       | 1              | 10           |
| Pro        | 20             | 60           |
| Agency     | 100            | 120          |
| Enterprise | ∞              | 300          |

### 7.3 Plan-Middleware
```javascript
// middleware/plan-gate.js
function planGate(feature) {
  return async (req, res, next) => {
    const user = req.user;
    const limits = PLAN_LIMITS[user.plan];
    
    if (limits[feature] <= user[`${feature}_used`]) {
      return res.status(429).json({
        error: 'Limit erreicht',
        upgrade_url: '/upgrade'
      });
    }
    
    next();
  };
}
```

---

## 8. Zahlungsintegration (Stripe)

### 8.1 Checkout-Flow
```
1. User klickt "Upgrade"
2. POST /api/user/upgrade → Stripe Checkout Session
3. Stripe Checkout → Zahlung
4. Stripe Webhook → subscription.created
5. User.plan = 'pro', Limit erhöht
```

### 8.2 Stripe Webhook Handler
```javascript
// routes/webhook.js
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  
  switch (event.type) {
    case 'checkout.session.completed':
      await activateSubscription(event.data.object);
      break;
    case 'invoice.payment_failed':
      await downgradeUser(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await cancelSubscription(event.data.object);
      break;
  }
  
  res.json({ received: true });
});
```

---

## 9. Sicherheit

| Maßnahme | Implementation |
|----------|---------------|
| **HTTPS** | Vercel + Railway (TLS 1.3) |
| **CORS** | Whitelist: eigene Domain |
| **Rate Limiting** | Express-rate-limit + Redis |
| **Input Validation** | Zod für alle API-Requests |
| **SQL Injection** | Parameterized Queries (pg) |
| **XSS** | React escaped by default |
| **CSRF** | JWT in HttpOnly-Cookie |
| **Crawl-Schutz** | robots.txt respektieren, 5s Delay zwischen Requests |

---

## 10. Deployment

### 10.1 Umgebungen

| Umgebung | URL | Zweck |
|----------|-----|-------|
| **Production** | siteamplify.app | Live |
| **Staging** | staging.siteamplify.app | Tests |
| **Local** | localhost:3000 / 5173 | Entwicklung |

### 10.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: railway/cli@v2
        with:
          command: up
          service: siteamplify-api

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 10.3 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/siteamplify

# Redis
REDIS_URL=redis://host:6379

# OpenAI
OPENAI_API_KEY=sk-...

# DataForSEO
DATAFORSEO_LOGIN=...
DATAFORSEO_PASSWORD=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_AGENCY=price_...

# Auth
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# App
NODE_ENV=production
API_URL=https://api.siteamplify.app
FRONTEND_URL=https://siteamplify.app
```

---

## 11. Kosten-Schätzung (Monatlich, Start)

| Service | Kosten/Monat |
|---------|-------------|
| Vercel Pro | 20€ |
| Railway (API + DB) | 25€ |
| Redis (Upstash) | 10€ |
| OpenAI API | 50€ (variiert) |
| DataForSEO | 50€ |
| Stripe (Gebühren) | ~3% Umsatz |
| Domain | 1€ |
| **Gesamt Fix** | **~156€/Monat** |

**Break-even:** ~6 Pro-Abos oder 2 Agency-Abos.

---

## 12. MVP-Entwicklungsplan

| Phase | Dauer | Lieferung |
|-------|-------|-----------|
| **Woche 1** | 7 Tage | Backend-Setup, DB, Auth, Basic Crawler |
| **Woche 2** | 7 Tage | Frontend-Setup, Landing Page, Dashboard UI |
| **Woche 3** | 7 Tage | Analyse-Flow, SERP-Integration, Score-Berechnung |
| **Woche 4** | 7 Tage | Vorschlags-Algorithmus, Content-Brief Generation |
| **Woche 5** | 7 Tage | Text-Generierung, Export, Stripe-Zahlung |
| **Woche 6** | 7 Tage | Testing, Bugfixes, Performance-Optimierung |
| **Woche 7** | 7 Tage | Beta-Launch, Feedback-Sammlung |

**Gesamtdauer MVP: ~7 Wochen**

---

## 13. Offene Entscheidungen

| Entscheidung | Optionen | Empfehlung |
|-------------|----------|------------|
| **Frontend Framework** | React vs. Next.js vs. Vue | **Next.js 14** (SSR für SEO, API Routes) |
| **Crawler** | Puppeteer vs. Playwright | **Playwright** (schneller, besser SPA-Support) |
| **CSS** | Tailwind vs. Chakra vs. shadcn | **Tailwind + shadcn/ui** (schnell, schön) |
| **State Management** | Zustand vs. TanStack Query | **TanStack Query** (Server-State) |
| **Forms** | React Hook Form vs. Formik | **React Hook Form + Zod** |
| **AI-Modell** | GPT-4o vs. Claude 3.5 | **GPT-4o** (schneller, günstiger) |

---

*Technische Spezifikation erstellt am: 2026-04-25*
*Autor: Thomas (Oberbeck Marketing)*
*Status: Bereit für Entwicklung*
