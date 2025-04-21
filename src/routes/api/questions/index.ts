import type { FastifyPluginCallback } from 'fastify';
import {
  createQuestionOpt,
  getQuestionByIdOpt,
  updateQuestionOpt,
  deleteQuestionOpt
} from './schema';

const questionsRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.post('', createQuestionOpt(fastify));
  fastify.get('/:id', getQuestionByIdOpt(fastify));
  fastify.put('/:id', updateQuestionOpt(fastify));
  fastify.delete('/:id', deleteQuestionOpt(fastify));

  done();
};

export default questionsRoutes;
