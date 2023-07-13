import request from 'supertest';
import application from '../src/app';

describe('GET /api/ping', () => {
	it('It should return 200 OK', async () => {
		const response = await request(application).get('/api/ping');

		expect(response.statusCode).toBe(200);
		expect(response.body).toBe('');
	});
});
