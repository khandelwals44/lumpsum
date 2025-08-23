import request from 'supertest';
import { createApp } from '../src/app';
import { signAccessToken } from '../src/auth';

describe('Backend API Tests', () => {
  let app: any;
  let authToken: string;

  beforeAll(async () => {
    app = createApp();
    authToken = signAccessToken('u1', 'USER');
  });

  describe('Health Check', () => {
    it('should return 200 for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Authentication', () => {
    it('should protect routes that require authentication', async () => {
      const response = await request(app)
        .get('/me')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorized');
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
    });
  });

  describe('Learning Hub API', () => {
    it('should return learning chapters', async () => {
      const response = await request(app)
        .get('/learning/chapters')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return chapter content by ID', async () => {
      const response = await request(app)
        .get('/learning/content/lc1')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title');
    });

    it('should save learning progress with auth', async () => {
      const progressData = {
        chapterId: 'lc1',
        completed: true,
        progress: 100,
        timeSpent: 300
      };

      const response = await request(app)
        .post('/learning/progress/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send(progressData)
        .expect(200);

      expect(response.body).toHaveProperty('completed', true);
      expect(response.body).toHaveProperty('progress', 100);
    });

    it('should return user learning progress with auth', async () => {
      const response = await request(app)
        .get('/learning/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Calculator History API', () => {
    it('should save calculation history with auth', async () => {
      const calculationData = {
        calcType: 'SIP',
        inputJson: JSON.stringify({
          monthlyInvestment: 10000,
          expectedReturn: 12,
          timePeriod: 10
        }),
        outputJson: JSON.stringify({
          totalInvestment: 1200000,
          totalReturns: 800000,
          maturityAmount: 2000000
        })
      };

      const response = await request(app)
        .post('/calc-history')
        .set('Authorization', `Bearer ${authToken}`)
        .send(calculationData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('calcType', 'SIP');
    });

    it('should return user calculation history with auth', async () => {
      const response = await request(app)
        .get('/calc-history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/calc-history')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Performance Tests', () => {
    it('should respond to health check within 100ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
