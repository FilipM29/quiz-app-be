import type { FastifyPluginCallback } from 'fastify';
import { getHealthOpt } from './schema';

const healthRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.get('/', getHealthOpt());

  done();
};

export default healthRoutes;
