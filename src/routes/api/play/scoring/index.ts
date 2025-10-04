import type { FastifyPluginCallback } from 'fastify';
import {
  getPendingSessionsOpt,
  getSessionWithAnswersOpt,
  getPendingAnswersOpt,
  scoreAnswerOpt,
  getQuizSessionsOpt
} from './schema';

const scoringRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  // All scoring endpoints require authentication (teacher/admin access)

  // Get all sessions with pending scoring
  fastify.get('/sessions', {
    preHandler: [fastify.requireAuth],
    ...getPendingSessionsOpt()
  });

  // Get specific session with all answers
  fastify.get('/sessions/:sessionId', {
    preHandler: [fastify.requireAuth],
    ...getSessionWithAnswersOpt()
  });

  // Get pending answers for a session
  fastify.get('/sessions/:sessionId/answers', {
    preHandler: [fastify.requireAuth],
    ...getPendingAnswersOpt()
  });

  // Score a specific answer
  fastify.post('/answers/:answerId/score', {
    preHandler: [fastify.requireAuth],
    ...scoreAnswerOpt()
  });

  // Get all sessions for a specific quiz
  fastify.get('/quizzes/:quizId/sessions', {
    preHandler: [fastify.requireAuth],
    ...getQuizSessionsOpt()
  });

  done();
};

export default scoringRoutes;
