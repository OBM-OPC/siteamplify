const crawlerService = require('./crawler.service');
const aiService = require('./ai.service');
const analysisModel = require('../models/analysis.model');
const pool = require('../db');

class AnalysisService {
  async runAnalysis(analysisId) {
    try {
      // Step 1: Crawl
      await analysisModel.updateStatus(analysisId, 'crawling');
      const analysis = await analysisModel.getById(analysisId);
      const crawlData = await crawlerService.crawl(analysis.url);

      // Step 2: Generate scores
      const scores = this.calculateScores(crawlData);

      // Step 3: Generate suggestions with AI
      await analysisModel.updateStatus(analysisId, 'analyzing');
      const suggestions = await aiService.generateSuggestions(crawlData, []);

      // Step 4: Save results
      await analysisModel.updateResults(analysisId, {
        page_title: crawlData.pageTitle,
        meta_description: crawlData.metaDescription,
        h1_count: crawlData.headings?.h1 || 0,
        h2_count: crawlData.headings?.h2 || 0,
        h3_count: crawlData.headings?.h3 || 0,
        word_count: crawlData.wordCount,
        image_count: crawlData.images?.length || 0,
        images_without_alt: crawlData.images?.filter(img => !img.alt)?.length || 0,
        internal_links: crawlData.internalLinks || 0,
        external_links: crawlData.externalLinks || 0,
        has_schema: crawlData.hasSchema,
        schema_types: crawlData.schemaTypes || [],
        seo_score: scores.seoScore,
        ki_score: scores.kiScore,
        content_score: scores.contentScore,
        technical_score: scores.technicalScore,
        raw_data: crawlData
      });

      // Step 5: Save suggestions
      for (const s of suggestions) {
        await pool.query(
          `INSERT INTO page_suggestions 
           (analysis_id, suggested_url_path, title, description, primary_keyword, 
            secondary_keywords, search_volume, difficulty, traffic_potential, 
            effort_score, priority_score) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            analysisId,
            s.suggested_url_path,
            s.title,
            s.description,
            s.primary_keyword,
            JSON.stringify(s.secondary_keywords || []),
            s.search_volume || 0,
            s.difficulty || 50,
            s.traffic_potential || 0,
            s.effort_score || 3,
            Math.round((s.traffic_potential || 0) / (s.effort_score || 3))
          ]
        );
      }

      await analysisModel.updateStatus(analysisId, 'completed');
      return { analysisId, suggestionsCount: suggestions.length };
    } catch (error) {
      await analysisModel.updateStatus(analysisId, 'failed');
      console.error(`Analysis ${analysisId} failed:`, error);
      throw error;
    }
  }

  calculateScores(data) {
    let seoScore = 50;
    let kiScore = 30;
    let contentScore = 50;
    let technicalScore = 60;

    // SEO Score
    if (data.pageTitle && data.pageTitle.length > 30 && data.pageTitle.length < 60) seoScore += 15;
    if (data.metaDescription && data.metaDescription.length > 120 && data.metaDescription.length < 160) seoScore += 15;
    if (data.headings?.h1 === 1) seoScore += 10;
    if (data.headings?.h2 > 2) seoScore += 5;
    if (data.internalLinks > 3) seoScore += 5;

    // Content Score
    if (data.wordCount > 500) contentScore += 15;
    if (data.wordCount > 1000) contentScore += 10;
    if (data.images?.length > 2) contentScore += 10;
    if (!data.images?.some(img => !img.alt)) contentScore += 15;

    // KI Score
    if (data.hasSchema) kiScore += 20;
    if (data.wordCount > 800) kiScore += 15;
    if (data.headings?.h2 > 3) kiScore += 10;
    if (data.metaDescription) kiScore += 10;

    // Technical Score
    if (data.externalLinks > 0) technicalScore += 10;
    if (data.internalLinks > 5) technicalScore += 10;
    if (data.headings?.h3 > 2) technicalScore += 10;

    return {
      seoScore: Math.min(100, seoScore),
      kiScore: Math.min(100, kiScore),
      contentScore: Math.min(100, contentScore),
      technicalScore: Math.min(100, technicalScore)
    };
  }
}

module.exports = new AnalysisService();
