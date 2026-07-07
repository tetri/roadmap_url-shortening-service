import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { getDatabase, closeDatabase } from '../src/database';

const BASE_URL = '/shorten';

describe('URL Shortening Service API', () => {
  beforeAll(() => {
    process.env.DATABASE_PATH = './data/test-url-shortener.db';
  });

  afterAll(() => {
    closeDatabase();
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
  });
});
