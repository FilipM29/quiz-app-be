import type { FastifyPluginCallback } from 'fastify';
import {
  getAllCategoriesOpt,
  getCategoryByIdOpt,
  getQuizzesByCategoryOpt
} from '~/routes/api/categories/schema';

const categoriesRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  fastify.get('', getAllCategoriesOpt());
  fastify.get('/:id', getCategoryByIdOpt());
  fastify.get('/:id/quiz', getQuizzesByCategoryOpt());

  done();
};

export default categoriesRoutes;
