import type { FastifyPluginCallback } from 'fastify';
import {
  createRoundOpt,
  getRoundByIdOpt,
  updateRoundOpt,
  deleteRoundOpt,
  getQuestionsByRoundIdOpt
} from './schema';

const roundsRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.post('', createRoundOpt(fastify));
  fastify.get('/:id', getRoundByIdOpt(fastify));
  fastify.put('/:id', updateRoundOpt(fastify));
  fastify.delete('/:id', deleteRoundOpt(fastify));
  fastify.get('/:id/questions', getQuestionsByRoundIdOpt(fastify));

  done();
};

export default roundsRoutes;
