import fastifyAuth from '@fastify/auth';
import fastifyAutoload from '@fastify/autoload';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify, { type FastifyServerOptions } from 'fastify';
import fastifyRawBody from 'fastify-raw-body';
import { join } from 'path';
import { rawBodyOptions, swaggerOptions } from '~/config';
import { errorHandler } from '~/utils/error';

export default async function createServer(options?: FastifyServerOptions) {
  const server = fastify(options);
  server.setErrorHandler(errorHandler);

  await server.register(fastifyAuth);
  await server.register(fastifyCors);
  await server.register(fastifyMultipart);
  await server.register(fastifyRawBody, rawBodyOptions);
  await server.register(fastifySwagger, swaggerOptions);
  await server.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  });

  await server.register(fastifyAutoload, {
    dir: join(__dirname, 'plugins'),
    options: {}
  });

  await server.register(fastifyAutoload, {
    dir: join(__dirname, 'routes'),
    options: {}
  });

  return server;
}
