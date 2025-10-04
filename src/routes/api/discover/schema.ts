import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import {
  getRecommendedForUser,
  searchQuizzes,
  getRandomQuizzes,
  getSimilarQuizzes,
  getQuizStats
} from './handler';

// Type definitions
const QuizAuthor = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String()
});

const QuizDiscoverItem = Type.Object({
  id: Type.String(),
  title: Type.String(),
  description: Type.String(),
  pictureUrl: Type.Optional(Type.String()),
  quizType: Type.Union([Type.Literal('SLIDES'), Type.Literal('JEOPARDY')]),
  category: Type.Union([
    Type.Literal('SPORT'),
    Type.Literal('GEOGRAPHY'),
    Type.Literal('SCIENCE'),
    Type.Literal('HISTORY'),
    Type.Literal('POP_CULTURE'),
    Type.Literal('ENTERTAINMENT'),
    Type.Literal('TECHNOLOGY'),
    Type.Literal('LITERATURE'),
    Type.Literal('FOOD'),
    Type.Literal('BUSINESS'),
    Type.Literal('HEALTH'),
    Type.Literal('NATURE'),
    Type.Literal('MATHEMATICS'),
    Type.Literal('LANGUAGES'),
    Type.Literal('CURRENT_EVENTS'),
    Type.Literal('OTHER')
  ]),
  difficulty: Type.Union([
    Type.Literal('EASY'),
    Type.Literal('MEDIUM'),
    Type.Literal('HARD')
  ]),
  numOfRounds: Type.Number(),
  numOfPlays: Type.Number(),
  rating: Type.Number(),
  createdAt: Type.String({ format: 'date-time' }),
  author: QuizAuthor,
  _count: Type.Object({
    ratings: Type.Number(),
    rounds: Type.Optional(Type.Number())
  })
});

const SearchResult = Type.Object({
  quizzes: Type.Array(QuizDiscoverItem),
  pagination: Type.Object({
    total: Type.Number(),
    limit: Type.Number(),
    offset: Type.Number(),
    hasMore: Type.Boolean()
  })
});

const QuizStats = Type.Object({
  totalQuizzes: Type.Number(),
  totalPlays: Type.Number(),
  avgRating: Type.Number(),
  topAuthors: Type.Array(
    Type.Object({
      id: Type.String(),
      firstName: Type.String(),
      lastName: Type.String(),
      _count: Type.Object({
        quizes: Type.Number()
      })
    })
  )
});

// Route schemas
const getRecommendedForUserSchema: FastifySchema = {
  description: 'Get personalized quiz recommendations based on play history',
  tags: ['discover'],
  querystring: Type.Object({
    limit: Type.Optional(Type.String())
  }),
  response: {
    200: Type.Array(QuizDiscoverItem),
    500: Type.Object({
      message: Type.String()
    })
  }
};

const searchQuizzesSchema: FastifySchema = {
  description: 'Search quizzes with filters and sorting',
  tags: ['discover'],
  querystring: Type.Object({
    q: Type.Optional(Type.String()),
    author: Type.Optional(Type.String()),
    type: Type.Optional(
      Type.Union([Type.Literal('SLIDES'), Type.Literal('JEOPARDY')])
    ),
    category: Type.Optional(
      Type.Union([
        Type.Literal('SPORT'),
        Type.Literal('GEOGRAPHY'),
        Type.Literal('SCIENCE'),
        Type.Literal('HISTORY'),
        Type.Literal('POP_CULTURE'),
        Type.Literal('ENTERTAINMENT'),
        Type.Literal('TECHNOLOGY'),
        Type.Literal('LITERATURE'),
        Type.Literal('FOOD'),
        Type.Literal('BUSINESS'),
        Type.Literal('HEALTH'),
        Type.Literal('NATURE'),
        Type.Literal('MATHEMATICS'),
        Type.Literal('LANGUAGES'),
        Type.Literal('CURRENT_EVENTS'),
        Type.Literal('OTHER')
      ])
    ),
    minRating: Type.Optional(Type.String()),
    minPlays: Type.Optional(Type.String()),
    minRounds: Type.Optional(Type.String()),
    maxRounds: Type.Optional(Type.String()),
    limit: Type.Optional(Type.String()),
    offset: Type.Optional(Type.String()),
    sortBy: Type.Optional(
      Type.Union([
        Type.Literal('popular'),
        Type.Literal('recent'),
        Type.Literal('rating'),
        Type.Literal('title')
      ])
    ),
    sortOrder: Type.Optional(
      Type.Union([Type.Literal('asc'), Type.Literal('desc')])
    )
  }),
  response: {
    200: SearchResult,
    500: Type.Object({
      message: Type.String()
    })
  }
};

const getRandomQuizzesSchema: FastifySchema = {
  description: 'Get random quizzes for discovery',
  tags: ['discover'],
  querystring: Type.Object({
    limit: Type.Optional(Type.String())
  }),
  response: {
    200: Type.Array(QuizDiscoverItem),
    500: Type.Object({
      message: Type.String()
    })
  }
};

const getSimilarQuizzesSchema: FastifySchema = {
  description: 'Get quizzes similar to a given quiz',
  tags: ['discover'],
  params: Type.Object({
    quizId: Type.String()
  }),
  querystring: Type.Object({
    limit: Type.Optional(Type.String())
  }),
  response: {
    200: Type.Array(QuizDiscoverItem),
    500: Type.Object({
      message: Type.String()
    })
  }
};

const getQuizStatsSchema: FastifySchema = {
  description: 'Get platform quiz statistics',
  tags: ['discover'],
  response: {
    200: QuizStats,
    500: Type.Object({
      message: Type.String()
    })
  }
};

// Export route options
export const getRecommendedForUserOpt = () => ({
  schema: getRecommendedForUserSchema,
  handler: getRecommendedForUser
});

export const searchQuizzesOpt = () => ({
  schema: searchQuizzesSchema,
  handler: searchQuizzes
});

export const getRandomQuizzesOpt = () => ({
  schema: getRandomQuizzesSchema,
  handler: getRandomQuizzes
});

export const getSimilarQuizzesOpt = () => ({
  schema: getSimilarQuizzesSchema,
  handler: getSimilarQuizzes
});

export const getQuizStatsOpt = () => ({
  schema: getQuizStatsSchema,
  handler: getQuizStats
});
