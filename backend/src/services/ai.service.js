const { OpenAI } = require('openai');

let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  console.warn('⚠️ OpenAI not initialized:', e.message);
}

class AIService {
  isAvailable() {
    return !!openai;
  }

  async generateBrief(crawlData, competitorData, suggestion) {
    if (!this.isAvailable()) {
      return this._dummyBrief(suggestion);
    }

    const prompt = `Du bist ein SEO-Experte. Erstelle einen Content-Brief für eine Unterseite.

Website: ${crawlData.url}
Hauptthema: ${suggestion.primary_keyword}
Zielgruppe: ${this.inferAudience(crawlData.domain)}

Kontext der bestehenden Website:
- Aktuelle Seitentitel: ${crawlData.pageTitle || 'Nicht gesetzt'}
- Aktuelle Meta-Description: ${crawlData.metaDescription || 'Nicht gesetzt'}
- Aktuelle Wortanzahl: ${crawlData.wordCount || 0}
- H1-Struktur: ${(crawlData.h1s || []).join(', ')}

Konkurrenten (werden abgedeckt):
${(competitorData || []).map(c => `- ${c.competitor_title}: ${(c.topics_covered || []).join(', ')}`).join('\n')}

Erstelle einen Content-Brief als JSON:
{
  "target_audience": "...",
  "tone_of_voice": "professionell|locker|technisch",
  "word_count_target": 1200,
  "outline": [
    { "h2": "Überschrift", "h3s": ["Unterüberschrift 1", "Unterüberschrift 2"] }
  ],
  "key_points": ["Punkt 1", "Punkt 2"],
  "internal_link_suggestions": [
    { "anchor": "...", "target": "/..." }
  ],
  "title_suggestion": "... (max. 60 Zeichen)",
  "meta_description_suggestion": "... (max. 160 Zeichen)"
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    });

    return JSON.parse(response.choices[0].message.content);
  }

  async generateContent(brief) {
    if (!this.isAvailable()) {
      return this._dummyContent(brief);
    }

    const prompt = `Schreibe einen vollständigen SEO-optimierten Artikel basierend auf diesem Content-Brief:

Zielgruppe: ${brief.target_audience}
Tonality: ${brief.tone_of_voice}
Wortanzahl-Ziel: ${brief.word_count_target}

Outline:
${(brief.outline || []).map(o => `## ${o.h2}\n${(o.h3s || []).map(h3 => `### ${h3}`).join('\n')}`).join('\n')}

Key Points:
${(brief.key_points || []).join('\n')}

Schreibe den Artikel in Markdown. Nutze Überschriften (H2, H3), Absätze, Aufzählungen und Zwischenüberschriften für Lesbarkeit.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000
    });

    return response.choices[0].message.content;
  }

  async generateSuggestions(crawlData, competitorData) {
    if (!this.isAvailable()) {
      return this._dummySuggestions(crawlData);
    }

    const prompt = `Basierend auf dieser Website-Analyse, schlage 5-10 fehlende Unterseiten vor, die Traffic bringen könnten.

Aktuelle Website: ${crawlData.url}
Seitentitel: ${crawlData.pageTitle || 'Nicht gesetzt'}
H1: ${(crawlData.h1s || []).join(', ')}
Inhaltsthemen (H2): ${(crawlData.h2s || []).slice(0, 10).join(', ')}
Wortanzahl: ${crawlData.wordCount}

Konkurrenten-Titel:
${(competitorData || []).map(c => `- ${c.competitor_title}`).join('\n')}

Antworte als JSON-Array:
[
  {
    "suggested_url_path": "/blog/...",
    "title": "...",
    "description": "...",
    "primary_keyword": "...",
    "secondary_keywords": ["..."],
    "search_volume": 1000,
    "difficulty": 35,
    "traffic_potential": 500,
    "effort_score": 2
  }
]
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 3000
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.suggestions || result;
  }

  inferAudience(domain) {
    if (domain.includes('shop') || domain.includes('store')) return 'Online-Shopper';
    if (domain.includes('blog')) return 'Informationsuchende Leser';
    if (domain.includes('arzt') || domain.includes('praxis')) return 'Patienten';
    if (domain.includes('bau') || domain.includes('handwerk')) return 'Bauherren & Hausbesitzer';
    return 'Allgemeine Zielgruppe';
  }

  // Dummy data generators for when OpenAI is not available
  _dummyBrief(suggestion) {
    return {
      target_audience: this.inferAudience(suggestion.primary_keyword),
      tone_of_voice: 'professionell',
      word_count_target: 1200,
      outline: [
        { h2: 'Einleitung', h3s: ['Problemstellung', 'Lösungsansatz'] },
        { h2: 'Hauptteil', h3s: ['Schritt 1', 'Schritt 2', 'Schritt 3'] },
        { h2: 'Fazit', h3s: ['Zusammenfassung', 'Call-to-Action'] }
      ],
      key_points: [
        'Erkläre die Kernproblematik',
        'Biete konkrete Lösungsansätze',
        'Nutze Beispiele aus der Praxis'
      ],
      internal_link_suggestions: [
        { anchor: 'Mehr erfahren', target: '/' }
      ],
      title_suggestion: `${suggestion.title} | Expert Guide 2025`,
      meta_description_suggestion: `Erfahren Sie alles über ${suggestion.primary_keyword}. Praktische Tipps und Expertenwissen in unserem umfassenden Guide.`
    };
  }

  _dummyContent(brief) {
    return `# ${brief.title_suggestion || 'Artikel'}

## Einleitung

Dies ist ein automatisch generierter Platzhalter-Artikel. Sobald ein OpenAI API Key konfiguriert ist, werden hier hochwertige, SEO-optimierte Inhalte generiert.

## Hauptteil

### Schritt 1
Beschreibung des ersten Schritts...

### Schritt 2
Beschreibung des zweiten Schritts...

### Schritt 3
Beschreibung des dritten Schritts...

## Fazit

Zusammenfassung der wichtigsten Punkte und Call-to-Action.
`;
  }

  _dummySuggestions(crawlData) {
    const domain = crawlData.domain || 'example.com';
    const topics = [
      { keyword: 'SEO Grundlagen', path: '/seo-grundlagen' },
      { keyword: 'Content Marketing', path: '/content-marketing' },
      { keyword: 'Local SEO', path: '/local-seo' },
      { keyword: 'KI Tools', path: '/ki-tools' },
      { keyword: 'Website Optimierung', path: '/website-optimierung' }
    ];

    return topics.map((t, i) => ({
      suggested_url_path: t.path,
      title: `${t.keyword}: Der ultimative Guide für ${domain}`,
      description: `Umfassender Guide zu ${t.keyword} mit praktischen Tipps und Strategien.`,
      primary_keyword: t.keyword,
      secondary_keywords: ['SEO', 'Marketing', 'Guide'],
      search_volume: 1000 + (i * 200),
      difficulty: 30 + (i * 5),
      traffic_potential: 500 + (i * 100),
      effort_score: 2
    }));
  }
}

module.exports = new AIService();
