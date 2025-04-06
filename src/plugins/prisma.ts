import type { PrismaClient } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import { prisma } from '~/utils';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }

  interface FastifyRequest {
    prisma: PrismaClient;
  }
}

const fastifyPrisma: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.decorate('prisma', prisma);

  fastify.addHook('onRequest', (req, _reply, done) => {
    req.prisma = prisma;
    done();
  });

  done();
};

export default fp(fastifyPrisma, {
  name: '@mfqa/prisma'
});
