import { createClient, type Client, type InArgs } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const localUrl = `file:${path.join(dbDir, 'poochandi.db').replace(/\\/g, '/')}`;
const url = process.env.TURSO_DATABASE_URL || localUrl;
const authToken = process.env.TURSO_AUTH_TOKEN;

let client: Client | null = null;
let initPromise: Promise<void> | null = null;

export function getDb(): Client {
  if (!client) client = createClient({ url, authToken });
  return client;
}

export async function queryAll<T = Record<string, unknown>>(sql: string, args: InArgs = []): Promise<T[]> {
  const r = await getDb().execute({ sql, args });
  return r.rows as unknown as T[];
}

export async function queryOne<T = Record<string, unknown>>(sql: string, args: InArgs = []): Promise<T | undefined> {
  const rows = await queryAll<T>(sql, args);
  return rows[0];
}

export async function execute(sql: string, args: InArgs = []) {
  return getDb().execute({ sql, args });
}

export async function batch(statements: Array<{ sql: string; args?: InArgs }>) {
  return getDb().batch(statements.map((s) => ({ sql: s.sql, args: s.args ?? [] })), 'write');
}

async function seedIfNeeded() {
  const existingAdmin = await queryOne<{ id: string }>('SELECT id FROM admin_users WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    const passwordHash = bcrypt.hashSync('Poochandi#@2001', 10);
    await execute('INSERT OR IGNORE INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)', ['admin-1', 'admin', passwordHash]);
  }

  const defaultSettings: Record<string, string> = {
    site_name: 'Poochandi.in',
    tagline: 'Modern Parenting with Folklore Magic',
    parent_brand: 'Buzz Creations',
    instagram_handle: '@poochandi_ig',
    instagram_url: 'https://instagram.com/poochandi_ig',
    youtube_name: 'Poochandi Varaan',
    youtube_url: 'https://youtube.com/@poochandivaraan',
    whatsapp_number: '+919876543210',
    contact_email: 'hello@poochandi.in',
    adsense_publisher_id: 'ca-pub-0000000000000000',
    google_analytics_id: 'G-XXXXXXXXXX',
    reel1_id: 'reel-1', reel1_title: 'When Kids Refuse to Eat Veggies! 🥦', reel1_url: 'https://www.instagram.com/poochandi_ig/reel/sample1/', reel1_thumbnail: '/images/reel-thumb-1.svg', reel1_desc: 'Poochandi explains why spinach gives superhero powers!',
    reel2_id: 'reel-2', reel2_title: 'Say Goodbye to Bedtime Meltdowns 🌙', reel2_url: 'https://www.instagram.com/poochandi_ig/reel/sample2/', reel2_thumbnail: '/images/reel-thumb-2.svg', reel2_desc: 'A calming nighttime story method that puts toddlers to sleep in 15 mins.',
    reel3_id: 'reel-3', reel3_title: 'Smart Alternative to Phone Addiction 📱', reel3_url: 'https://www.instagram.com/poochandi_ig/reel/sample3/', reel3_thumbnail: '/images/reel-thumb-3.svg', reel3_desc: '3 easy games that replace screen cravings naturally.',
    reel4_id: 'reel-4', reel4_title: 'Teaching Kids to Respect Elders with Love ❤️', reel4_url: 'https://www.instagram.com/poochandi_ig/reel/sample4/', reel4_thumbnail: '/images/reel-thumb-4.svg', reel4_desc: 'Why manners become fun habits when taught with humor.',
    logo_url: '/images/poochandi-logo.svg',
    character_hero_url: '/images/poochandi-hero.svg',
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await execute('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)', [key, value]);
  }

  const countArticles = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM articles');
  if (!countArticles || Number(countArticles.count) === 0) {
    // Minimal seed marker; full article seed can be added via admin or a separate seed script.
    // Keep init fast and idempotent. Existing projects may already have article seed logic.
  }
}

export async function initDb(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await batch([
      { sql: `CREATE TABLE IF NOT EXISTS complaint_names (id TEXT PRIMARY KEY, child_name TEXT NOT NULL, child_age INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'ACTIVE', created_at TEXT DEFAULT (datetime('now')))` },
      { sql: `CREATE TABLE IF NOT EXISTS child_requests (id TEXT PRIMARY KEY, parent_name TEXT NOT NULL, child_name TEXT NOT NULL, nickname TEXT, age_grade TEXT NOT NULL, behavior TEXT NOT NULL, city TEXT, special_instructions TEXT, consent INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'PENDING', created_at TEXT DEFAULT (datetime('now')))` },
      { sql: `CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title_en TEXT NOT NULL, title_ta TEXT NOT NULL, excerpt_en TEXT NOT NULL, excerpt_ta TEXT NOT NULL, content_en TEXT NOT NULL, content_ta TEXT NOT NULL, category TEXT NOT NULL, featured_image TEXT, read_time TEXT DEFAULT '5 min read', published INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))` },
      { sql: `CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)` },
      { sql: `CREATE TABLE IF NOT EXISTS admin_users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))` },
    ]);
    await seedIfNeeded();
  })();
  return initPromise;
}

// Backward-compatible default export placeholder is removed; update imports to named async helpers.
export default { getDb, queryAll, queryOne, execute, batch, initDb };
