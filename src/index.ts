import 'dotenv/config';
import createServer from './server';

const port: number = parseInt(process.env.PORT || '8080');

console.log('Starting server...');

async function init() {
  const server = await createServer({
    logger: true
  });

  await server.listen({ port, host: '0.0.0.0' });
}

init().catch((err) => {
  console.error(err);
  throw new Error('Failed to start server!');
});
