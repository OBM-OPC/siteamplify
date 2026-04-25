const pool = require('../db');

async function getAll(limit = 50, offset = 0) {
  const { rows } = await pool.query(
    'SELECT * FROM analyses ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query('SELECT * FROM analyses WHERE id = $1', [id]);
  return rows[0] || null;
}

async function getByUser(userId, limit = 50, offset = 0) {
  const { rows } = await pool.query(
    'SELECT * FROM analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
  return rows;
}

async function create({ user_id, url, domain }) {
  const { rows } = await pool.query(
    'INSERT INTO analyses (user_id, url, domain) VALUES ($1, $2, $3) RETURNING *',
    [user_id, url, domain]
  );
  return rows[0];
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    'UPDATE analyses SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return rows[0];
}

async function updateResults(id, data) {
  const { rows } = await pool.query(
    `UPDATE analyses SET 
      status = 'completed',
      page_title = $1,
      meta_description = $2,
      h1_count = $3,
      h2_count = $4,
      h3_count = $5,
      word_count = $6,
      image_count = $7,
      images_without_alt = $8,
      internal_links = $9,
      external_links = $10,
      has_schema = $11,
      schema_types = $12,
      seo_score = $13,
      ki_score = $14,
      content_score = $15,
      technical_score = $16,
      raw_data = $17,
      completed_at = NOW()
    WHERE id = $18 RETURNING *`,
    [
      data.page_title,
      data.meta_description,
      data.h1_count,
      data.h2_count,
      data.h3_count,
      data.word_count,
      data.image_count,
      data.images_without_alt,
      data.internal_links,
      data.external_links,
      data.has_schema,
      JSON.stringify(data.schema_types),
      data.seo_score,
      data.ki_score,
      data.content_score,
      data.technical_score,
      JSON.stringify(data.raw_data),
      id
    ]
  );
  return rows[0];
}

async function remove(id) {
  await pool.query('DELETE FROM analyses WHERE id = $1', [id]);
}

module.exports = {
  getAll,
  getById,
  getByUser,
  create,
  updateStatus,
  updateResults,
  remove
};
