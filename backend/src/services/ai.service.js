const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class AIService {
  async generateBrief(crawlData, competitorData, suggestion) {
    const prompt = `
Du bist ein SEO-Experte. Erstelle einen Content-Brief für eine Unterseite.

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
    const prompt = `
Schreibe einen vollständigen SEO-optimierten Artikel basierend auf diesem Content-Brief:

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
    const prompt = `
Basierend auf dieser Website-Analyse, schlage 5-10 fehlende Unterseiten vor, die Traffic bringen könnten.

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
}

module.exports = new AIService();
