import {FastifyPluginCallback} from "fastify";
import {createQuizOpt, deleteQuizOpt, getAllQuizzesOpt, getQuizByIdOpt, updateQuizOpt} from "~/routes/api/quiz/schema";


const quizRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.post('/', createQuizOpt(fastify));
  fastify.get('/:id', getQuizByIdOpt(fastify));
  fastify.get('/all', getAllQuizzesOpt(fastify));
  fastify.put('/:id', updateQuizOpt(fastify));
  fastify.delete('/:id', deleteQuizOpt(fastify));

  done();
};

export default quizRoutes;
