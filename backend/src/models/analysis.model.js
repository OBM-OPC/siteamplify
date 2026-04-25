const { run, all, get } = require('../db');

async function getAll(limit = 50, offset = 0) {
  return await all(
    'SELECT * FROM analyses ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
}

async function getById(id) {
  return await get('SELECT * FROM analyses WHERE id = ?', [id]);
}

async function getByUser(userId, limit = 50, offset = 0) {
  return await all(
    'SELECT * FROM analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );
}

async function create({ user_id, url, domain }) {
  const result = await run(
    'INSERT INTO analyses (user_id, url, domain) VALUES (?, ?, ?)',
    [user_id, url, domain]
  );
  return await getById(result.id);
}

async function updateStatus(id, status) {
  await run('UPDATE analyses SET status = ? WHERE id = ?', [status, id]);
  return await getById(id);
}

async function updateResults(id, data) {
  await run(
    `UPDATE analyses SET 
      status = 'completed',
      page_title = ?,
      meta_description = ?,
      h1_count = ?,
      h2_count = ?,
      h3_count = ?,
      word_count = ?,
      image_count = ?,
      images_without_alt = ?,
      internal_links = ?,
      external_links = ?,
      has_schema = ?,
      schema_types = ?,
      seo_score = ?,
      ki_score = ?,
      content_score = ?,
      technical_score = ?,
      raw_data = ?,
      completed_at = datetime('now')
    WHERE id = ?`,
    [
      data.page_title || null,
      data.meta_description || null,
      data.h1_count || 0,
      data.h2_count || 0,
      data.h3_count || 0,
      data.word_count || 0,
      data.image_count || 0,
      data.images_without_alt || 0,
      data.internal_links || 0,
      data.external_links || 0,
      data.has_schema ? 1 : 0,
      JSON.stringify(data.schema_types || []),
      data.seo_score,
      data.ki_score,
      data.content_score,
      data.technical_score,
      JSON.stringify(data.raw_data || {}),
      id
    ]
  );
  return await getById(id);
}

async function remove(id) {
  await run('DELETE FROM analyses WHERE id = ?', [id]);
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
