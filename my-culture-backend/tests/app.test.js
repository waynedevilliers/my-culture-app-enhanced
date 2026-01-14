
import { request } from './setup.js';

describe('App', () => {
  it('should respond with a 418 status code', async () => {
    const response = await request.get('/');
    expect(response.statusCode).toBe(418);
  });
});
