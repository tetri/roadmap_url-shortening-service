import { getDatabase } from '../database';
import { generateShortCode } from '../utils/short-code';
import { NotFoundError } from '../utils/errors';
import { UrlRecord } from '../models/url';

export function createShortUrl(url: string): UrlRecord {
  const db = getDatabase();

  let shortCode: string;
  let attempts = 0;

  do {
    shortCode = generateShortCode();
    attempts++;
    if (attempts > 10) {
      throw new Error('Failed to generate unique short code');
    }
  } while (db.prepare('SELECT 1 FROM urls WHERE short_code = ?').get(shortCode));

  const stmt = db.prepare(
    'INSERT INTO urls (url, short_code) VALUES (?, ?)'
  );
  const result = stmt.run(url, shortCode);

  return db.prepare('SELECT * FROM urls WHERE id = ?').get(result.lastInsertRowid) as UrlRecord;
}

export function getUrlByShortCode(shortCode: string): UrlRecord {
  const db = getDatabase();

  const record = db.prepare('SELECT * FROM urls WHERE short_code = ?').get(shortCode) as UrlRecord | undefined;

  if (!record) {
    throw new NotFoundError('Short URL not found');
  }

  return record;
}

export function incrementAccessCount(shortCode: string): void {
  const db = getDatabase();

  const result = db.prepare(
    "UPDATE urls SET access_count = access_count + 1, updated_at = datetime('now') WHERE short_code = ?"
  ).run(shortCode);

  if (result.changes === 0) {
    throw new NotFoundError('Short URL not found');
  }
}

export function updateShortUrl(shortCode: string, newUrl: string): UrlRecord {
  const db = getDatabase();

  const existing = db.prepare('SELECT * FROM urls WHERE short_code = ?').get(shortCode);
  if (!existing) {
    throw new NotFoundError('Short URL not found');
  }

  db.prepare(
    "UPDATE urls SET url = ?, updated_at = datetime('now') WHERE short_code = ?"
  ).run(newUrl, shortCode);

  return db.prepare('SELECT * FROM urls WHERE short_code = ?').get(shortCode) as UrlRecord;
}

export function deleteShortUrl(shortCode: string): void {
  const db = getDatabase();

  const result = db.prepare('DELETE FROM urls WHERE short_code = ?').run(shortCode);

  if (result.changes === 0) {
    throw new NotFoundError('Short URL not found');
  }
}

export function getUrlStats(shortCode: string): UrlRecord {
  return getUrlByShortCode(shortCode);
}
