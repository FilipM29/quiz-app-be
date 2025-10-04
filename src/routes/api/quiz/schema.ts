import {
  QuizStatus,
  QuizType,
  QuizVisibility,
  Category,
  Difficulty
} from '@prisma/client';
import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import {
  createQuiz,
  deleteQuiz,
  getUserQuizzes,
  getQuizById,
  getRoundsByQuizId,
  updateQuiz
} from '~/routes/api/quiz/handler';
import { User } from '../users/schema';

const Quiz = Type.Object({
  id: Type.String({ minLength: 1 }),
  title: Type.String({ minLength: 1, maxLength: 200 }),
  description: Type.String({ minLength: 1, maxLength: 1000 }),
  pictureUrl: Type.Optional(Type.String({ format: 'uri' })),
  quizVisibility: Type.Enum(QuizVisibility, {
    examples: Object.keys(QuizVisibility)
  }),
  category: Type.Enum(Category, { examples: Object.keys(Category) }),
  difficulty: Type.Enum(Difficulty, { examples: Object.keys(Difficulty) }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  numOfRounds: Type.Number({ minimum: 1, maximum: 50 }),
  numOfPlays: Type.Number({ minimum: 0 }),
  quizType: Type.Enum(QuizType, { examples: Object.keys(QuizType) }),
  quizStatus: Type.Enum(QuizStatus, { examples: Object.keys(QuizStatus) }),
  rating: Type.Number({ minimum: 0, maximum: 5 }),
  authorId: Type.String({ minLength: 1 })
});

const createQuizSchema: FastifySchema = {
  description: 'Create a new quiz',
  tags: ['quiz'],
  body: Type.Pick(Quiz, [
    'title',
    'quizType',
    'quizStatus',
    'numOfRounds',
    'description',
    'quizVisibility',
    'category',
    'difficulty',
    'pictureUrl'
  ]),
  response: {
    201: Quiz
  }
};

const getQuizByIdSchema: FastifySchema = {
  description: 'Get a quiz by ID',
  tags: ['quiz'],
  params: Type.Object({
    id: Type.String({
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_-]+$'
    })
  }),
  response: {
    200: Type.Intersect([
      Quiz,
      Type.Object({
        author: User,
        rounds: Type.Array(
          Type.Object({
            id: Type.String(),
            quizId: Type.String(),
            order: Type.Number(),
            title: Type.String()
          })
        )
      })
    ]),
    404: Type.Object({
      message: Type.String()
    })
  }
};

const getUserQuizzesSchema: FastifySchema = {
  description: 'Get all quizzes for a specific user',
  tags: ['quiz'],
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: Type.Array(Quiz)
  }
};

const updateQuizSchema: FastifySchema = {
  description: 'Update a quiz by ID',
  tags: ['quiz'],
  params: Type.Object({
    id: Type.String({
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_-]+$'
    })
  }),
  body: Type.Partial(
    Type.Pick(Quiz, [
      'title',
      'description',
      'pictureUrl',
      'quizVisibility',
      'category',
      'difficulty',
      'numOfRounds',
      'quizType',
      'quizStatus'
    ])
  ),
  response: {
    200: Quiz,
    404: Type.Object({
      message: Type.String()
    })
  }
};

const deleteQuizSchema: FastifySchema = {
  description: 'Delete a quiz by ID',
  tags: ['quiz'],
  params: Type.Object({
    id: Type.String({
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_-]+$'
    })
  }),
  response: {
    200: Type.Object({
      message: Type.String()
    }),
    404: Type.Object({
      message: Type.String()
    })
  }
};

const getRoundsByQuizIdSchema: FastifySchema = {
  description: 'Get all rounds for a specific quiz by quiz ID',
  tags: ['quizzes'],
  params: Type.Object({
    id: Type.String({
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_-]+$'
    })
  }),
  response: {
    200: Type.Array(
      Type.Object({
        id: Type.String(),
        quizId: Type.String(),
        order: Type.Number(),
        title: Type.String()
      })
    ),
    404: Type.Object({
      message: Type.String()
    })
  }
};

export const getRoundsByQuizIdOpt = () => ({
  schema: getRoundsByQuizIdSchema,
  handler: getRoundsByQuizId
});

export const createQuizOpt = () => ({
  schema: createQuizSchema,
  handler: createQuiz
});

export const getQuizByIdOpt = () => ({
  schema: getQuizByIdSchema,
  handler: getQuizById
});

export const getMyQuizzesOpt = () => ({
  schema: getUserQuizzesSchema,
  handler: getUserQuizzes
});

export const updateQuizOpt = () => ({
  schema: updateQuizSchema,
  handler: updateQuiz
});

export const deleteQuizOpt = () => ({
  schema: deleteQuizSchema,
  handler: deleteQuiz
});
