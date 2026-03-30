import request from 'supertest';
import app from '../src/app';

describe('Health Check', () => {
  it('should return 200 OK with health status', async () => {
    const response = await request(app)
      .get('/v1/health')
      .set('x-rapidapi-key', 'test_key');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe('talentpulse-api');
    expect(response.body.data.version).toBe('1.0.0');
  });
});
