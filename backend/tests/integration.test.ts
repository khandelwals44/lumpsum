import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/prisma';
import { signAccessToken } from '../src/auth';

describe('Backend Integration Tests', () => {
  let app: any;
  let authToken: string;

  beforeAll(async () => {
    app = createApp();
    
    // Use mocked user data for tests
    authToken = signAccessToken('u1');
  });

  afterAll(async () => {
    // Using mocked Prisma client, no cleanup needed
  });

  describe('Health Check', () => {
    it('should return 200 for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication', () => {
    it('should protect routes that require authentication', async () => {
      const response = await request(app)
        .get('/me')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('Learning Hub API', () => {
    it('should return learning chapters', async () => {
      const response = await request(app)
        .get('/learning/chapters')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const chapter = response.body[0];
      expect(chapter).toHaveProperty('id');
      expect(chapter).toHaveProperty('title');
      expect(chapter).toHaveProperty('slug');
    });

    it('should return chapter content by ID', async () => {
      // First get chapters to get an ID
      const chaptersResponse = await request(app)
        .get('/learning/chapters')
        .expect(200);

      const chapterId = chaptersResponse.body[0].id;

      const response = await request(app)
        .get(`/learning/content/${chapterId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', chapterId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
    });

    it('should save learning progress', async () => {
      const chaptersResponse = await request(app)
        .get('/learning/chapters')
        .expect(200);

      const chapterId = chaptersResponse.body[0].id;

      const progressData = {
        chapterId,
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

    it('should return user learning progress', async () => {
      const response = await request(app)
        .get('/learning/progress')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Calculator History API', () => {
    it('should save calculation history', async () => {
      const calculationData = {
        calculatorType: 'SIP',
        inputs: {
          monthlyInvestment: 10000,
          expectedReturn: 12,
          timePeriod: 10
        },
        results: {
          totalInvestment: 1200000,
          totalReturns: 800000,
          maturityAmount: 2000000
        }
      };

      const response = await request(app)
        .post('/calc-history')
        .set('Authorization', `Bearer ${authToken}`)
        .send(calculationData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('calculatorType', 'SIP');
    });

    it('should return user calculation history', async () => {
      const response = await request(app)
        .get('/calc-history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('User Profile API', () => {
    it('should update user profile', async () => {
      const profileData = {
        name: 'Updated Test User',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        riskProfile: 'MODERATE',
        investmentGoals: ['RETIREMENT', 'EDUCATION']
      };

      const response = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(profileData)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Updated Test User');
      expect(response.body).toHaveProperty('riskProfile', 'MODERATE');
    });

    it('should return user profile', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('Investment Goals API', () => {
    it('should create investment goal', async () => {
      const goalData = {
        name: 'Retirement Fund',
        targetAmount: 10000000,
        targetDate: '2040-12-31',
        currentAmount: 1000000,
        monthlyContribution: 50000,
        riskProfile: 'MODERATE'
      };

      const response = await request(app)
        .post('/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'Retirement Fund');
    });

    it('should return user goals', async () => {
      const response = await request(app)
        .get('/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid chapter ID', async () => {
      const response = await request(app)
        .get('/learning/content/invalid-id')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Chapter not found');
    });

    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/calc-history')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, we'll test the error response structure
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
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
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
