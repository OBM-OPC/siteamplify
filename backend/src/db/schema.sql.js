const pool = require('../db');

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        plan VARCHAR(20) DEFAULT 'free',
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        analyses_used INTEGER DEFAULT 0,
        analyses_limit INTEGER DEFAULT 1,
        briefs_used INTEGER DEFAULT 0,
        briefs_limit INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        url TEXT NOT NULL,
        domain VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        page_title VARCHAR(255),
        meta_description TEXT,
        h1_count INTEGER DEFAULT 0,
        h2_count INTEGER DEFAULT 0,
        h3_count INTEGER DEFAULT 0,
        word_count INTEGER DEFAULT 0,
        image_count INTEGER DEFAULT 0,
        images_without_alt INTEGER DEFAULT 0,
        internal_links INTEGER DEFAULT 0,
        external_links INTEGER DEFAULT 0,
        has_schema BOOLEAN DEFAULT FALSE,
        schema_types JSONB DEFAULT '[]',
        seo_score INTEGER,
        ki_score INTEGER,
        content_score INTEGER,
        technical_score INTEGER,
        raw_html_hash VARCHAR(64),
        raw_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS competitor_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
        keyword VARCHAR(255) NOT NULL,
        position INTEGER,
        competitor_url TEXT NOT NULL,
        competitor_title VARCHAR(255),
        competitor_meta TEXT,
        competitor_word_count INTEGER,
        topics_covered JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS page_suggestions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
        suggested_url_path VARCHAR(255),
        title VARCHAR(255),
        description TEXT,
        primary_keyword VARCHAR(255),
        secondary_keywords JSONB DEFAULT '[]',
        search_volume INTEGER,
        difficulty INTEGER,
        traffic_potential INTEGER,
        effort_score INTEGER,
        priority_score INTEGER,
        status VARCHAR(20) DEFAULT 'suggested',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS content_briefs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        suggestion_id UUID REFERENCES page_suggestions(id) ON DELETE CASCADE,
        analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
        target_audience VARCHAR(255),
        tone_of_voice VARCHAR(50),
        word_count_target INTEGER,
        outline JSONB DEFAULT '[]',
        key_points JSONB DEFAULT '[]',
        title_suggestion VARCHAR(255),
        meta_description_suggestion TEXT,
        internal_link_suggestions JSONB DEFAULT '[]',
        generated_content TEXT,
        generated_title VARCHAR(255),
        generated_meta TEXT,
        generated_schema JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        generated_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'queued',
        payload JSONB NOT NULL,
        result JSONB DEFAULT '{}',
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        started_at TIMESTAMP,
        completed_at TIMESTAMP
      );
    `);
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database init error:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { initDB };
