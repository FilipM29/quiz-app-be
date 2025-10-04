import type { FastifyInstance } from 'fastify';
import {
  getRecommendedForUserOpt,
  searchQuizzesOpt,
  getRandomQuizzesOpt,
  getSimilarQuizzesOpt,
  getQuizStatsOpt
} from './schema';

export default async function discoverRoutes(fastify: FastifyInstance) {
  // Discovery endpoints (public)
  fastify.get('/random', getRandomQuizzesOpt());
  fastify.get('/search', searchQuizzesOpt());
  fastify.get('/stats', getQuizStatsOpt());

  // Personalized recommendations (authenticated)
  fastify.get('/recommended', {
    preHandler: [fastify.requireAuth],
    ...getRecommendedForUserOpt()
  });

  // Similar quizzes
  fastify.get('/similar/:quizId', getSimilarQuizzesOpt());
}
