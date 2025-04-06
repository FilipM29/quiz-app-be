import type { FastifyInstance } from 'fastify';
import createServer from '~/server';

let server: FastifyInstance;

describe('fastify server', () => {
  beforeAll(async () => {
    server = await createServer();
  });

  it('should receive 200 response', async () => {
    const response = await server.inject({
      method: 'GET',
      url: 'api/health'
    });

    expect(response.statusCode).toEqual(200);
  });
});
