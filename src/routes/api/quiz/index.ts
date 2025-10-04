import type { FastifyPluginCallback } from 'fastify';
import {
  createQuizOpt,
  deleteQuizOpt,
  getMyQuizzesOpt,
  getQuizByIdOpt,
  getRoundsByQuizIdOpt,
  updateQuizOpt
} from '~/routes/api/quiz/schema';

const quizRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  // Public routes (no auth required)
  fastify.get('/:id', getQuizByIdOpt());
  fastify.get('/:id/rounds', getRoundsByQuizIdOpt());

  // Protected routes (auth required)
  fastify.post('', {
    preHandler: [fastify.requireAuth],
    ...createQuizOpt()
  });

  fastify.put('/:id', {
    preHandler: [fastify.requireAuth],
    ...updateQuizOpt()
  });

  fastify.delete('/:id', {
    preHandler: [fastify.requireAuth],
    ...deleteQuizOpt()
  });

  fastify.get('/my/:id', {
    preHandler: [fastify.requireAuth],
    ...getMyQuizzesOpt()
  });

  done();
};

export default quizRoutes;
