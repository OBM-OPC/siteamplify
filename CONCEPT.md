# SEO + KI Visibility Booster — Produktkonzept

## Vision
Eine Web-App, die jede Website analysiert, Lücken in SEO und KI-Sichtbarkeit identifiziert und passende Unterseiten samt Content-Briefs automatisch generiert.

---

## 1. Produktname (Vorschläge)
- **SiteAmplify** (favorisiert)
- **PageGenesis**
- **RankForge**
- **ContentArchitect**

---

## 2. Kernprobleme (Pain Points)

| Problem | Beschreibung |
|---------|-------------|
| **SEO-Blindheit** | Seitenbetreiber wissen nicht, was sie gegenüber Konkurrenten vermissen |
| **Content-Lücken** | Fehlende Unterseiten, die Traffic bringen würden |
| **KI-Sichtbarkeit** | ChatGPT, Perplexity & Co. finden Inhalte nicht, weil Struktur/Entities fehlen |
| **Zeitmangel** | SEO-Recherche und Content-Briefs dauern Stunden pro Seite |
| **Teure Tools** | Ahrefs, Semrush, SurferSEO kosten 100-500€/Monat |

---

## 3. Lösung (Value Proposition)

> Gib eine URL ein. In < 2 Minuten weißt du exakt, welche Unterseiten fehlen — mit fertigen Content-Briefs.

### Die 3 Schritte

1. **Analyse** — Crawle & audit die eingegebene URL
2. **Vergleich** — Identifiziere Content-Lücken vs. Top-Konkurrenten
3. **Generierung** — Erstelle passende Unterseiten-Ideen + Content-Briefs

---

## 4. Features (MVP)

### 4.1 Analyse-Modul

| Feature | Beschreibung |
|---------|-------------|
| **URL-Crawler** | Ruft HTML, Meta-Daten, Struktur, Text-Content ab |
| **On-Page SEO-Check** | Titel, Description, H-Struktur, Alt-Texte, interne Links |
| **Core Web Vitals** | Ladezeit, CLS, LCP (via Lighthouse API) |
| **Schema-Markup** | Prüft vorhandene JSON-LD / Microdata |
| **Content-Qualität** | Wortanzahl, Lesbarkeit, Keyword-Dichte, Top-Themen |
| **KI-Readiness** | Entity-Erkennung, FAQ-Potenzial, HowTo-Struktur, Q&A-Schema |
| **Wettbewerbsanalyse** | Vergleich mit Top-3 SERP-Ergebnissen für Hauptkeyword |
| **Content-Gap-Analyse** | Themen, die Konkurrenten abdecken, aber du nicht |

### 4.2 Vorschlags-Modul

| Feature | Beschreibung |
|---------|-------------|
| **Unterseiten-Vorschläge** | Liste fehlender Seiten mit Begründung |
| **Keyword-Zuordnung** | Passende Long-tail Keywords pro Vorschlag |
| **Content-Briefs** | Struktur, Wortanzahl, Keywords, interne Links, Zielgruppe |
| **Priorisierung** | Traffic-Potenzial × Aufwand = Score |
| **Cluster-Vorschlag** | Themen-Cluster für interne Verlinkung |

### 4.3 Generierungs-Modul

| Feature | Beschreibung |
|---------|-------------|
| **Text-Generierung** | Fertiger Artikel/Seiten-Text basierend auf Brief |
| **Meta-Daten** | Generiert Title + Description |
| **Schema-JSON** | Fertiges FAQ- oder HowTo-Schema |
| **Export** | Markdown, HTML, oder direkter WordPress-Import |

---

## 5. Tech-Stack (Empfehlung)

| Layer | Technologie | Begründung |
|-------|-------------|-----------|
| **Frontend** | React + Tailwind | Schnelle UI, gute Komponenten-Bibliotheken |
| **Backend** | Node.js / Express | Einfache API, schnelle Prototypen |
| **Crawler** | Cheerio / Puppeteer | HTML-Parsing, SPA-Unterstützung |
| **SEO-Daten** | DataForSEO API | SERP-Daten, Keyword-Recherche |
| **KI-Generierung** | OpenAI GPT-4o / Anthropic Claude | Content-Briefs, Text-Generierung |
| **Datenbank** | PostgreSQL + Redis | Nutzerdaten, Crawl-Cache |
| **Hosting** | Vercel (Frontend) + Railway/Render (Backend) | Kostengünstig, skalierbar |
| **Auth** | Clerk / Auth0 | Schnelles Login, OAuth |
| **Zahlungen** | Stripe | Abo-Modell |

---

## 6. UI/UX Konzept

### User Flow

```
Landing Page
    ↓
[URL eingeben] → [Analyse starten]
    ↓
Loading-Screen (max. 90 Sek. mit Fortschrittsbalken)
    ↓
Dashboard mit Ergebnissen:
  ├─ Score-Karte (SEO + KI-Sichtbarkeit)
  ├─ Top 3 Probleme (rot markiert)
  ├─ Fehlende Unterseiten (Vorschläge)
  └─ Content-Briefs (klickbar für Details)
    ↓
[Content-Brief öffnen] → [Text generieren lassen] → [Exportieren]
```

### Dashboard-Ansicht

- **Header:** URL + Aktualisierungsdatum
- **Score-Bereich:** 2 große Zahlen (SEO-Score, KI-Score)
- **Problem-Kacheln:** Rot/Gelb/Grün — klickbar für Details
- **Vorschlags-Tabelle:** Unterseiten mit Traffic-Schätzung, Priorität, Aktionen
- **Content-Brief-Modal:** Struktur, Keywords, generierter Text

---

## 7. Monetarisierung

### Freemium-Modell

| Plan | Preis | Inklusive |
|------|-------|-----------|
| **Free** | 0€ | 1 Analyse/Monat, 3 Vorschläge, keine Generierung |
| **Pro** | 29€/Monat | 20 Analysen/Monat, unbegrenzte Vorschläge, 10 Content-Briefs, Export |
| **Agency** | 99€/Monat | 100 Analysen, unbegrenzte Briefs, API-Zugang, White-Label |
| **Enterprise** | Custom | Unlimitiert, Custom-Integration, dedizierter Support |

### Zusätzliche Einnahmequellen
- Pay-per-use Text-Generierung (über Plan hinaus)
- Affiliate-Links zu SEO-Tools
- Template-Marketplace für Content-Briefs

---

## 8. Zielgruppe & Go-to-Market

### Primäre Zielgruppen
1. **Freelancer & Solopreneure** — brauchen schnelle SEO-Ergebnisse
2. **Kleine Marketing-Agenturen** — skalieren Content-Produktion
3. **E-Commerce-Betreiber** — mehr Produktseiten = mehr Traffic

### Go-to-Market
- **Phase 1:** Beta mit 50 Nutzern (kostenlos, Feedback sammeln)
- **Phase 2:** ProductHunt-Launch, IndieHackers, Twitter/X
- **Phase 3:** SEO für eigene Keywords (Dogfooding!)
- **Phase 4:** Affiliate-Programm für Agenturen

---

## 9. MVP-Umfang (Phase 1)

### Muss enthalten
- [ ] URL-Eingabe + Crawler
- [ ] Basis-SEO-Analyse (Titel, Meta, H-Struktur, Content)
- [ ] Content-Gap-Analyse (vs. SERP-Top-3)
- [ ] 5-10 Unterseiten-Vorschläge mit Keywords
- [ ] 1 Content-Brief pro Vorschlag
- [ ] Text-Generierung (pro Vorschlag 1x)
- [ ] Export als Markdown
- [ ] Stripe-Zahlung (Pro-Plan)

### Kann später kommen
- [ ] Core Web Vitals (Lighthouse)
- [ ] Schema-Markup-Validierung
- [ ] KI-Sichtbarkeits-Score (Entity-Analyse)
- [ ] WordPress-Export
- [ ] API-Zugang
- [ ] White-Label

---

## 10. Wettbewerbsanalyse

| Tool | Preis | Unsere Differenzierung |
|------|-------|----------------------|
| Ahrefs | ab 99€/Monat | Wir generieren Content, nicht nur Daten |
| SurferSEO | ab 69€/Monat | Wir schlagen Unterseiten vor, nicht nur Optimierung |
| Jasper AI | ab 49€/Monat | Wir analysieren zuerst, generieren dann gezielt |
| Clearscope | ab 170€/Monat | Wir sind günstiger + fokussiert auf Seitenerweiterung |
| **Wir** | **ab 29€/Monat** | **Analyse + Vorschlag + Generierung in einem Tool** |

---

## 11. Erfolgskennzahlen (KPIs)

| Metrik | Ziel (nach 6 Monaten) |
|--------|----------------------|
| Signups | 1.000 |
| Paying Customers | 100 (10% Conversion) |
| MRR | 5.000€ |
| Churn Rate | < 10% |
| NPS | > 40 |

---

## 12. Nächste Schritte

1. ✅ Produktkonzept (dieses Dokument)
2. 🔄 Technische Architektur & Datenmodell
3. ⏳ Wireframes & UI-Design
4. ⏳ MVP-Entwicklung (Frontend + Backend)
5. ⏳ Beta-Test mit 50 Nutzern
6. ⏳ Launch & Iteration

---

*Konzept erstellt am: 2026-04-25*
*Autor: Thomas (Oberbeck Marketing)*
*Status: Konzept abgeschlossen, bereit für technische Planung*
