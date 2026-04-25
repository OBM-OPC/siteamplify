const { run } = require('./index');

async function initDB() {
  try {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT NOT NULL,
        plan TEXT DEFAULT 'free',
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        analyses_used INTEGER DEFAULT 0,
        analyses_limit INTEGER DEFAULT 1,
        briefs_used INTEGER DEFAULT 0,
        briefs_limit INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Analyses table
    await run(`
      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id),
        url TEXT NOT NULL,
        domain TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        page_title TEXT,
        meta_description TEXT,
        h1_count INTEGER DEFAULT 0,
        h2_count INTEGER DEFAULT 0,
        h3_count INTEGER DEFAULT 0,
        word_count INTEGER DEFAULT 0,
        image_count INTEGER DEFAULT 0,
        images_without_alt INTEGER DEFAULT 0,
        internal_links INTEGER DEFAULT 0,
        external_links INTEGER DEFAULT 0,
        has_schema INTEGER DEFAULT 0,
        schema_types TEXT DEFAULT '[]',
        seo_score INTEGER,
        ki_score INTEGER,
        content_score INTEGER,
        technical_score INTEGER,
        raw_html_hash TEXT,
        raw_data TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME
      )
    `);

    // Competitor data table
    await run(`
      CREATE TABLE IF NOT EXISTS competitor_data (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        analysis_id TEXT REFERENCES analyses(id) ON DELETE CASCADE,
        keyword TEXT NOT NULL,
        position INTEGER,
        competitor_url TEXT NOT NULL,
        competitor_title TEXT,
        competitor_meta TEXT,
        competitor_word_count INTEGER,
        topics_covered TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Page suggestions table
    await run(`
      CREATE TABLE IF NOT EXISTS page_suggestions (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        analysis_id TEXT REFERENCES analyses(id) ON DELETE CASCADE,
        suggested_url_path TEXT,
        title TEXT,
        description TEXT,
        primary_keyword TEXT,
        secondary_keywords TEXT DEFAULT '[]',
        search_volume INTEGER,
        difficulty INTEGER,
        traffic_potential INTEGER,
        effort_score INTEGER,
        priority_score INTEGER,
        status TEXT DEFAULT 'suggested',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Content briefs table
    await run(`
      CREATE TABLE IF NOT EXISTS content_briefs (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        suggestion_id TEXT REFERENCES page_suggestions(id) ON DELETE CASCADE,
        analysis_id TEXT REFERENCES analyses(id) ON DELETE CASCADE,
        target_audience TEXT,
        tone_of_voice TEXT,
        word_count_target INTEGER,
        outline TEXT DEFAULT '[]',
        key_points TEXT DEFAULT '[]',
        title_suggestion TEXT,
        meta_description_suggestion TEXT,
        internal_link_suggestions TEXT DEFAULT '[]',
        generated_content TEXT,
        generated_title TEXT,
        generated_meta TEXT,
        generated_schema TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        generated_at DATETIME
      )
    `);

    // Jobs table
    await run(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        type TEXT NOT NULL,
        status TEXT DEFAULT 'queued',
        payload TEXT NOT NULL,
        result TEXT DEFAULT '{}',
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        started_at DATETIME,
        completed_at DATETIME
      )
    `);

    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database init error:', err);
    throw err;
  }
}

// Run if called directly
if (require.main === module) {
  initDB().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { initDB };
