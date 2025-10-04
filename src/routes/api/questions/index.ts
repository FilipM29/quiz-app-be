import type { FastifyPluginCallback } from 'fastify';
import {
  createQuestionOpt,
  getQuestionByIdOpt,
  updateQuestionOpt,
  deleteQuestionOpt
} from './schema';

const questionsRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  // POST /questions - Create a question (requires authentication and quiz ownership)
  fastify.post('', {
    preHandler: [fastify.requireAuth],
    ...createQuestionOpt()
  });

  // GET /questions/:id - Get a question by ID (public for quiz taking)
  fastify.get('/:id', getQuestionByIdOpt());

  // PUT /questions/:id - Update a question (requires authentication and quiz ownership)
  fastify.put('/:id', {
    preHandler: [fastify.requireAuth],
    ...updateQuestionOpt()
  });

  // DELETE /questions/:id - Delete a question (requires authentication and quiz ownership)
  fastify.delete('/:id', {
    preHandler: [fastify.requireAuth],
    ...deleteQuestionOpt()
  });

  done();
};

export default questionsRoutes;
