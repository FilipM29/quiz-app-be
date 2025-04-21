import { FastifyPluginCallback } from 'fastify';
import {
  createQuizOpt,
  deleteQuizOpt,
  getAllQuizzesOpt,
  getQuizByIdOpt,
  getRoundsByQuizIdOpt,
  updateQuizOpt
} from '~/routes/api/quiz/schema';

const quizRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.post('', createQuizOpt(fastify));
  fastify.get('/:id', getQuizByIdOpt(fastify));
  fastify.get('', getAllQuizzesOpt(fastify));
  fastify.put('/:id', updateQuizOpt(fastify));
  fastify.delete('/:id', deleteQuizOpt(fastify));
  fastify.get('/:id/rounds', getRoundsByQuizIdOpt(fastify));

  done();
};

export default quizRoutes;
