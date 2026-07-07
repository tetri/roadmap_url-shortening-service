import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import app from '../src/app';
import { getDatabase, closeDatabase } from '../src/database';

const BASE_URL = '/shorten';
const TEST_DB_PATH = './data/test-url-shortener.db';

describe('URL Shortening Service API', () => {
  beforeAll(() => {
    process.env.DATABASE_PATH = TEST_DB_PATH;
  });

  afterAll(() => {
    closeDatabase();
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('POST /shorten', () => {
    it('should create a short URL and return 201', async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://www.example.com/very/long/url' })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('url', 'https://www.example.com/very/long/url');
      expect(res.body).toHaveProperty('shortCode');
      expect(res.body).toHaveProperty('createdAt');
      expect(res.body).toHaveProperty('updatedAt');
      expect(res.body.shortCode).toHaveLength(6);
    });

    it('should return 400 for missing URL', async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({})
        .expect(400);

      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 for invalid URL', async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'not-a-url' })
        .expect(400);

      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 for empty URL', async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: '' })
        .expect(400);

      expect(res.body).toHaveProperty('errors');
    });

    it('should return 400 when url is not a string', async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 123 })
        .expect(400);

      expect(res.body).toHaveProperty('errors');
    });

    it('should accept URL with query parameters', async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://example.com/path?q=search&page=1#section' })
        .expect(201);

      expect(res.body).toHaveProperty('shortCode');
    });

    it('should accept URL at exactly 2048 characters', async () => {
      const prefix = 'https://example.com/';
      const longUrl = prefix + 'a'.repeat(2048 - prefix.length);
      expect(longUrl.length).toBe(2048);

      const res = await request(app)
        .post(BASE_URL)
        .send({ url: longUrl })
        .expect(201);

      expect(res.body).toHaveProperty('shortCode');
    });

    it('should return 400 when URL exceeds 2048 characters', async () => {
      const prefix = 'https://example.com/';
      const tooLongUrl = prefix + 'a'.repeat(2049 - prefix.length);
      expect(tooLongUrl.length).toBe(2049);

      const res = await request(app)
        .post(BASE_URL)
        .send({ url: tooLongUrl })
        .expect(400);

      expect(res.body).toHaveProperty('errors');
    });

    it('should generate a different short code for the same URL', async () => {
      const url = 'https://www.example.com/duplicate-test';

      const res1 = await request(app)
        .post(BASE_URL)
        .send({ url })
        .expect(201);

      const res2 = await request(app)
        .post(BASE_URL)
        .send({ url })
        .expect(201);

      expect(res1.body.shortCode).not.toBe(res2.body.shortCode);
    });
  });

  describe('GET /shorten/:shortCode', () => {
    let shortCode: string;

    beforeAll(async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://www.example.com/get-test' });
      shortCode = res.body.shortCode;
    });

    it('should retrieve the original URL and return 200', async () => {
      const res = await request(app)
        .get(`${BASE_URL}/${shortCode}`)
        .expect(200);

      expect(res.body).toHaveProperty('shortCode', shortCode);
      expect(res.body).toHaveProperty('url', 'https://www.example.com/get-test');
    });

    it('should return 404 for non-existent short code', async () => {
      await request(app)
        .get(`${BASE_URL}/nonexist`)
        .expect(404);
    });

    it('should return 404 for empty short code', async () => {
      await request(app)
        .get(`${BASE_URL}/`)
        .expect(404);
    });
  });

  describe('GET /:shortCode (redirect)', () => {
    let shortCode: string;

    beforeAll(async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://www.example.com/redirect-test' });
      shortCode = res.body.shortCode;
    });

    it('should redirect to the original URL with 302', async () => {
      const res = await request(app)
        .get(`/${shortCode}`)
        .expect(302);

      expect(res.headers.location).toBe('https://www.example.com/redirect-test');
    });

    it('should return 404 for non-existent short code on redirect', async () => {
      await request(app)
        .get(`/nonexist`)
        .expect(404);
    });
  });

  describe('PUT /shorten/:shortCode', () => {
    let shortCode: string;

    beforeAll(async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://www.example.com/put-test' });
      shortCode = res.body.shortCode;
    });

    it('should update the URL and return 200', async () => {
      const res = await request(app)
        .put(`${BASE_URL}/${shortCode}`)
        .send({ url: 'https://www.example.com/updated-url' })
        .expect(200);

      expect(res.body).toHaveProperty('shortCode', shortCode);
      expect(res.body).toHaveProperty('url', 'https://www.example.com/updated-url');
    });

    it('should return 404 for non-existent short code', async () => {
      await request(app)
        .put(`${BASE_URL}/nonexist`)
        .send({ url: 'https://www.example.com/new-url' })
        .expect(404);
    });

    it('should return 400 for invalid URL', async () => {
      await request(app)
        .put(`${BASE_URL}/${shortCode}`)
        .send({ url: 'invalid' })
        .expect(400);
    });

    it('should return 400 for missing URL in body', async () => {
      await request(app)
        .put(`${BASE_URL}/${shortCode}`)
        .send({})
        .expect(400);
    });

    it('should return 400 when url is not a string', async () => {
      await request(app)
        .put(`${BASE_URL}/${shortCode}`)
        .send({ url: null })
        .expect(400);
    });
  });

  describe('DELETE /shorten/:shortCode', () => {
    let shortCode: string;

    beforeAll(async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://www.example.com/delete-test' });
      shortCode = res.body.shortCode;
    });

    it('should delete the short URL and return 204', async () => {
      await request(app)
        .delete(`${BASE_URL}/${shortCode}`)
        .expect(204);
    });

    it('should return 404 after deletion', async () => {
      await request(app)
        .get(`${BASE_URL}/${shortCode}`)
        .expect(404);
    });

    it('should return 404 for non-existent short code', async () => {
      await request(app)
        .delete(`${BASE_URL}/nonexist`)
        .expect(404);
    });
  });

  describe('GET /shorten/:shortCode/stats', () => {
    let shortCode: string;

    beforeAll(async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://www.example.com/stats-test' });
      shortCode = res.body.shortCode;

      await request(app).get(`${BASE_URL}/${shortCode}`);
      await request(app).get(`${BASE_URL}/${shortCode}`);
    });

    it('should return stats with access count', async () => {
      const res = await request(app)
        .get(`${BASE_URL}/${shortCode}/stats`)
        .expect(200);

      expect(res.body).toHaveProperty('shortCode', shortCode);
      expect(res.body).toHaveProperty('url', 'https://www.example.com/stats-test');
      expect(res.body).toHaveProperty('accessCount');
      expect(res.body.accessCount).toBeGreaterThanOrEqual(2);
    });

    it('should return 404 for non-existent short code', async () => {
      await request(app)
        .get(`${BASE_URL}/nonexist/stats`)
        .expect(404);
    });

    it('should return stats with zero access count for a new URL', async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://www.example.com/fresh-stats' })
        .expect(201);

      const statsRes = await request(app)
        .get(`${BASE_URL}/${res.body.shortCode}/stats`)
        .expect(200);

      expect(statsRes.body.accessCount).toBe(0);
    });

    it('should increment access count via redirect', async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://www.example.com/redirect-stats' })
        .expect(201);

      const code = res.body.shortCode;

      await request(app).get(`/${code}`);

      const statsRes = await request(app)
        .get(`${BASE_URL}/${code}/stats`)
        .expect(200);

      expect(statsRes.body.accessCount).toBe(1);
    });
  });

  describe('Security Headers', () => {
    it('should include helmet security headers', async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://www.example.com/secure' });

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['x-xss-protection']).toBe('0');
    });

    it('should include CORS headers', async () => {
      const res = await request(app)
        .post(BASE_URL)
        .send({ url: 'https://www.example.com/cors' });

      expect(res.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('Unknown Routes', () => {
    it('should return 404 for an unknown route', async () => {
      await request(app)
        .get('/unknown-route')
        .expect(404);
    });
  });
});
