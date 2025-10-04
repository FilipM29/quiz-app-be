import type { FastifyPluginAsync } from 'fastify';
import { getMyRating, submitRating } from './handler';
import {
  QuizIdParamSchema,
  RatingResponseSchema,
  SubmitRatingSchema
} from './schema';

const rating: FastifyPluginAsync = async (fastify) => {
  // Submit or update rating for a quiz
  fastify.post<{
    Body: typeof SubmitRatingSchema.static;
    Params: typeof QuizIdParamSchema.static;
  }>(
    '/:quizId',
    {
      preHandler: [fastify.requireAuth],
      schema: {
        body: SubmitRatingSchema,
        params: QuizIdParamSchema,
        response: {
          200: RatingResponseSchema
        }
      }
    },
    submitRating
  );

  // Get current user's rating for a quiz
  fastify.get<{ Params: typeof QuizIdParamSchema.static }>(
    '/:quizId/me',
    {
      preHandler: [fastify.requireAuth],
      schema: {
        params: QuizIdParamSchema,
        response: {
          200: RatingResponseSchema
        }
      }
    },
    getMyRating
  );
};

export default rating;
