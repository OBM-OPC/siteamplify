const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

function resolveDbPath() {
  const configured = process.env.DATABASE_URL || process.env.SQLITE_PATH;

  if (configured && !configured.startsWith('postgres://') && !configured.startsWith('postgresql://')) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(__dirname, '../../', configured);
  }

  const volumeRoot = process.env.RAILWAY_VOLUME_MOUNT_PATH || '/data';
  return path.join(volumeRoot, 'siteamplify.db');
}

const dbPath = resolveDbPath();

// Ensure data directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Promisify db.run and db.all
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

module.exports = { db, run, all, get };
