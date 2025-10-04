import type { FastifyPluginCallback } from 'fastify';
import {
  createRoundOpt,
  getRoundByIdOpt,
  updateRoundOpt,
  deleteRoundOpt,
  getQuestionsByRoundIdOpt
} from './schema';

const roundsRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  // POST /rounds - Create a round (requires authentication and quiz ownership)
  fastify.post('', {
    preHandler: [fastify.requireAuth],
    ...createRoundOpt()
  });

  // GET /rounds/:id - Get a round by ID (public for quiz taking)
  fastify.get('/:id', getRoundByIdOpt());

  // PUT /rounds/:id - Update a round (requires authentication and quiz ownership)
  fastify.put('/:id', {
    preHandler: [fastify.requireAuth],
    ...updateRoundOpt()
  });

  // DELETE /rounds/:id - Delete a round (requires authentication and quiz ownership)
  fastify.delete('/:id', {
    preHandler: [fastify.requireAuth],
    ...deleteRoundOpt()
  });

  // GET /rounds/:id/questions - Get questions by round ID (public for quiz taking)
  fastify.get('/:id/questions', getQuestionsByRoundIdOpt());

  done();
};

export default roundsRoutes;
