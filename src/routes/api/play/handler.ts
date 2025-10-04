import type { FastifyRequest, FastifyReply } from 'fastify';
import { PlaySessionService } from '~/services/play';
import { messages } from '~/resources';
import type {
  StartSessionRequest,
  JoinSessionRequest,
  SubmitAnswerRequest
} from '~/types/play';

export const startSession = async (
  req: FastifyRequest<{ Body: StartSessionRequest }>,
  reply: FastifyReply
) => {
  try {
    if (!req.user) {
      return await reply
        .status(401)
        .send({ message: 'Authentication required' });
    }

    const session = await PlaySessionService.startSession(
      req.user.id,
      req.body
    );
    reply.status(201).send(session);
  } catch (error) {
    reply.status(400).send({
      message:
        error instanceof Error ? error.message : 'Failed to start session'
    });
  }
};

export const joinSession = async (
  req: FastifyRequest<{ Body: JoinSessionRequest }>,
  reply: FastifyReply
) => {
  try {
    const userId = req.user?.id || null;
    const result = await PlaySessionService.joinSession(userId, req.body);
    reply.status(200).send(result);
  } catch (error) {
    reply.status(400).send({
      message: error instanceof Error ? error.message : 'Failed to join session'
    });
  }
};

export const getSession = async (
  req: FastifyRequest<{ Params: { sessionId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { sessionId } = req.params;
    const session = await PlaySessionService.getSession(sessionId);
    reply.status(200).send(session);
  } catch {
    reply
      .status(404)
      .send({ message: messages.notFound('Session', req.params.sessionId) });
  }
};

export const getSessionState = async (
  req: FastifyRequest<{ Params: { sessionId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id || null;
    const sessionState = await PlaySessionService.getSessionState(
      sessionId,
      userId
    );
    reply.status(200).send(sessionState);
  } catch {
    reply
      .status(404)
      .send({ message: messages.notFound('Session', req.params.sessionId) });
  }
};

export const getSessionPlayers = async (
  req: FastifyRequest<{ Params: { sessionId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { sessionId } = req.params;
    const session = await PlaySessionService.getSession(sessionId);
    reply.status(200).send(session.players);
  } catch {
    reply
      .status(404)
      .send({ message: messages.notFound('Session', req.params.sessionId) });
  }
};

export const submitAnswer = async (
  req: FastifyRequest<{ Body: SubmitAnswerRequest }>,
  reply: FastifyReply
) => {
  try {
    // Use userId from body (for guests) or from authenticated user
    const userId = req.body.userId || req.user?.id || null;
    const answer = await PlaySessionService.submitAnswer(userId, req.body);
    reply.status(200).send(answer);
  } catch (error) {
    reply.status(400).send({
      message:
        error instanceof Error ? error.message : 'Failed to submit answer'
    });
  }
};

export const nextQuestion = async (
  req: FastifyRequest<{ Params: { sessionId: string } }>,
  reply: FastifyReply
) => {
  try {
    if (!req.user) {
      return await reply
        .status(401)
        .send({ message: 'Authentication required' });
    }

    const { sessionId } = req.params;
    const session = await PlaySessionService.nextQuestion(
      sessionId,
      req.user.id
    );
    reply.status(200).send(session);
  } catch (error) {
    reply.status(400).send({
      message:
        error instanceof Error ? error.message : 'Failed to advance question'
    });
  }
};

export const startGame = async (
  req: FastifyRequest<{ Params: { sessionId: string } }>,
  reply: FastifyReply
) => {
  try {
    if (!req.user) {
      return await reply
        .status(401)
        .send({ message: 'Authentication required' });
    }

    const { sessionId } = req.params;
    const session = await PlaySessionService.startGame(sessionId, req.user.id);
    reply.status(200).send(session);
  } catch (error) {
    reply.status(400).send({
      message: error instanceof Error ? error.message : 'Failed to start game'
    });
  }
};

export const finishSession = async (
  req: FastifyRequest<{ Params: { sessionId: string } }>,
  reply: FastifyReply
) => {
  try {
    if (!req.user) {
      return await reply
        .status(401)
        .send({ message: 'Authentication required' });
    }

    const { sessionId } = req.params;
    const session = await PlaySessionService.finishSession(
      sessionId,
      req.user.id
    );
    reply.status(200).send(session);
  } catch (error) {
    reply.status(400).send({
      message:
        error instanceof Error ? error.message : 'Failed to finish session'
    });
  }
};

export const leaveSession = async (
  req: FastifyRequest<{
    Params: { sessionId: string };
    Querystring: { userId?: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const { sessionId } = req.params;
    // Use userId from query (for guests) or from authenticated user
    const userId = req.query.userId || req.user?.id || null;
    await PlaySessionService.leaveSession(sessionId, userId);
    reply.status(200).send({ message: 'Left session successfully' });
  } catch (error) {
    reply.status(400).send({
      message:
        error instanceof Error ? error.message : 'Failed to leave session'
    });
  }
};

export const getActiveSessions = async (
  _req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const sessions = PlaySessionService.getAllActiveSessions();
    reply.status(200).send(sessions);
  } catch {
    reply.status(500).send({ message: 'Failed to get active sessions' });
  }
};
