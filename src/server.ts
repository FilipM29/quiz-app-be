import fastifyAuth from '@fastify/auth';
import fastifyAutoload from '@fastify/autoload';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify, { type FastifyServerOptions } from 'fastify';
import fastifyRawBody from 'fastify-raw-body';
import { join } from 'node:path';
import { rawBodyOptions, swaggerOptions } from '~/config';
import { errorHandler } from '~/utils/error';
import authPlugin from '~/plugins/auth';

export default async function createServer(options?: FastifyServerOptions) {
  const server = fastify(options);
  server.setErrorHandler(errorHandler);

  await server.register(fastifyAuth);
  await server.register(fastifyCors, {
    origin:
      process.env.NODE_ENVIRONMENT === 'development'
        ? ['http://localhost:5173', 'http://localhost:5174']
        : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  });
  await server.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
    errorResponseBuilder: function (_request, context) {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `I only allow ${context.max} requests per ${context.after} to this service. Try again soon.`
      };
    }
  });
  await server.register(fastifyMultipart);
  await server.register(fastifyRawBody, rawBodyOptions);
  await server.register(fastifySwagger, swaggerOptions);
  await server.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  });

  await server.register(authPlugin);

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
