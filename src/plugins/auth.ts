import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { getUserFromRequest } from '~/utils/auth';

async function authPlugin(fastify: FastifyInstance) {
  if (!fastify.hasDecorator('authenticate')) {
    fastify.decorate(
      'authenticate',
      async function (request: FastifyRequest, reply: FastifyReply) {
        try {
          const user = await getUserFromRequest(request);
          request.user = user;
        } catch (error) {
          reply.send(error);
        }
      }
    );
  }

  if (!fastify.hasDecorator('requireAuth')) {
    fastify.decorate(
      'requireAuth',
      async function (request: FastifyRequest, reply: FastifyReply) {
        try {
          const user = await getUserFromRequest(request);
          request.user = user;
        } catch (error) {
          reply.send(error);
        }
      }
    );
  }
}

export default fp(authPlugin, {
  name: 'auth-plugin'
});
