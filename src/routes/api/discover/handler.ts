import type { FastifyRequest, FastifyReply } from 'fastify';
import { DiscoverService } from '~/services/discover';

interface SearchQuery {
  q?: string;
  author?: string;
  type?: 'SLIDES' | 'JEOPARDY';
  category?:
    | 'SPORT'
    | 'GEOGRAPHY'
    | 'SCIENCE'
    | 'HISTORY'
    | 'POP_CULTURE'
    | 'ENTERTAINMENT'
    | 'TECHNOLOGY'
    | 'LITERATURE'
    | 'FOOD'
    | 'BUSINESS'
    | 'HEALTH'
    | 'NATURE'
    | 'MATHEMATICS'
    | 'LANGUAGES'
    | 'CURRENT_EVENTS'
    | 'OTHER';
  minRating?: string;
  minPlays?: string;
  minRounds?: string;
  maxRounds?: string;
  limit?: string;
  offset?: string;
  sortBy?: 'popular' | 'recent' | 'rating' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export const getRecommendedForUser = async (
  req: FastifyRequest<{ Querystring: { limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const quizzes = await DiscoverService.getRecommendedForUser(userId, limit);
    reply.status(200).send(quizzes);
  } catch {
    reply.status(500).send({ message: 'Failed to get recommended quizzes' });
  }
};

export const searchQuizzes = async (
  req: FastifyRequest<{ Querystring: SearchQuery }>,
  reply: FastifyReply
) => {
  try {
    const filters = {
      query: req.query.q,
      authorId: req.query.author,
      quizType: req.query.type,
      category: req.query.category,
      minRating: req.query.minRating
        ? parseFloat(req.query.minRating)
        : undefined,
      minPlays: req.query.minPlays ? parseInt(req.query.minPlays) : undefined,
      minRounds: req.query.minRounds
        ? parseInt(req.query.minRounds)
        : undefined,
      maxRounds: req.query.maxRounds ? parseInt(req.query.maxRounds) : undefined
    };

    const options = {
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      sortBy: req.query.sortBy || 'popular',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await DiscoverService.searchQuizzes(filters, options);
    reply.status(200).send(result);
  } catch {
    reply.status(500).send({ message: 'Failed to search quizzes' });
  }
};

export const getRandomQuizzes = async (
  req: FastifyRequest<{ Querystring: { limit?: string } }>,
  reply: FastifyReply
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const quizzes = await DiscoverService.getRandomQuizzes(limit);
    reply.status(200).send(quizzes);
  } catch {
    reply.status(500).send({ message: 'Failed to get random quizzes' });
  }
};

export const getSimilarQuizzes = async (
  req: FastifyRequest<{
    Params: { quizId: string };
    Querystring: { limit?: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const { quizId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;

    const quizzes = await DiscoverService.getSimilarQuizzes(quizId, limit);
    reply.status(200).send(quizzes);
  } catch {
    reply.status(500).send({ message: 'Failed to get similar quizzes' });
  }
};

export const getQuizStats = async (
  _req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const stats = await DiscoverService.getQuizStats();
    reply.status(200).send(stats);
  } catch {
    reply.status(500).send({ message: 'Failed to get quiz statistics' });
  }
};

