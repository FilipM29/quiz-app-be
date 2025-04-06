import createServer from './server';

describe('fastify server', () => {
  it('should start properly', async () => {
    const server = await createServer();
    const response = await server.inject({
      method: 'GET',
      url: '/'
    });

    expect(response.statusCode).toEqual(404);
  });
});
