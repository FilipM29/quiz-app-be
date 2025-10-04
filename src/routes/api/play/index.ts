import type { FastifyPluginCallback } from 'fastify';
import { getOptionalUserFromRequest } from '~/utils/auth';
import {
  startSessionOpt,
  joinSessionOpt,
  getSessionOpt,
  getSessionStateOpt,
  getSessionPlayersOpt,
  submitAnswerOpt,
  nextQuestionOpt,
  startGameOpt,
  finishSessionOpt,
  leaveSessionOpt,
  getActiveSessionsOpt
} from './schema';

const playRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  // Note: scoring routes are auto-loaded by fastify-autoload from ./scoring/index.ts

  // Optional auth handler that doesn't throw on missing auth
  const optionalAuth = async (req) => {
    const user = await getOptionalUserFromRequest(req);
    if (user) {
      req.user = user;
    }
  };

  // Session management routes
  // Host must be authenticated to start a session
  fastify.post('/start', {
    preHandler: [fastify.requireAuth],
    ...startSessionOpt()
  });

  // Join can be done by guests or authenticated users
  fastify.post('/join', {
    preHandler: [optionalAuth],
    ...joinSessionOpt()
  });

  fastify.get('/sessions/active', getActiveSessionsOpt());

  fastify.get('/:sessionId', getSessionOpt());

  // Session state can be accessed by guests
  fastify.get('/:sessionId/state', {
    preHandler: [optionalAuth],
    ...getSessionStateOpt()
  });

  fastify.get('/:sessionId/players', getSessionPlayersOpt());

  // Game control routes (host only - must be authenticated)
  fastify.post('/:sessionId/start-game', {
    preHandler: [fastify.requireAuth],
    ...startGameOpt()
  });

  fastify.post('/:sessionId/next', {
    preHandler: [fastify.requireAuth],
    ...nextQuestionOpt()
  });

  fastify.post('/:sessionId/finish', {
    preHandler: [fastify.requireAuth],
    ...finishSessionOpt()
  });

  // Player interaction routes - guests can answer and leave
  fastify.post('/answer', {
    preHandler: [optionalAuth],
    ...submitAnswerOpt()
  });

  fastify.delete('/:sessionId/leave', {
    preHandler: [optionalAuth],
    ...leaveSessionOpt()
  });

  done();
};

export default playRoutes;
