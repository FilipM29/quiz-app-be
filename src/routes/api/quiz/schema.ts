import { QuizStatus, QuizType, QuizVisibility } from '@prisma/client';
import { Type } from '@sinclair/typebox';
import { FastifySchema } from 'fastify';
import {
  createQuiz,
  deleteQuiz,
  getAllQuizzes,
  getUserQuizzes,
  getQuizById,
  getRoundsByQuizId,
  updateQuiz
} from '~/routes/api/quiz/handler';
import { User } from '../users/schema';
import {QuizAppFastifyInstance} from "~/models/fastify";

const Quiz = Type.Object({
  id: Type.String(),
  title: Type.String(),
  description: Type.String(),
  pictureUrl: Type.Optional(Type.String()),
  quizVisibility: Type.Enum(QuizVisibility, {
    examples: Object.keys(QuizVisibility)
  }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  numOfRounds: Type.Number(),
  numOfPlays: Type.Number(),
  quizType: Type.Enum(QuizType, { examples: Object.keys(QuizType) }),
  quizStatus: Type.Enum(QuizStatus, { examples: Object.keys(QuizStatus) }),
  rating: Type.Number(),
  authorId: Type.String()
});

  const createQuizSchema: FastifySchema = {
  description: 'Create a new quiz',
  tags: ['quiz'],
  body: Type.Pick(Quiz, [
    'title',
    'quizType',
    'quizStatus',
    'numOfRounds',
    'authorId',
    'description',
    'quizVisibility',
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
    id: Type.String()
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

const getAllQuizzesSchema: FastifySchema = {
  description: 'Get all quizzes',
  tags: ['quiz'],
  response: {
    200: Type.Array(Quiz)
  }
};

const updateQuizSchema: FastifySchema = {
  description: 'Update a quiz by ID',
  tags: ['quiz'],
  params: Type.Object({
    id: Type.String()
  }),
  body: Type.Object({
    data: Type.Partial(Type.Omit(Quiz, ['id']))
  }),
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
    id: Type.String()
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
    id: Type.String()
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

export const getRoundsByQuizIdOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: getRoundsByQuizIdSchema,
  preHandler: [_fastify.authenticate],
  handler: getRoundsByQuizId
});

export const createQuizOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: createQuizSchema,
  preHandler: [_fastify.authenticate],
  handler: createQuiz
});

export const getQuizByIdOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: getQuizByIdSchema,
  preHandler: [_fastify.authenticate],
  handler: getQuizById
});

export const getAllQuizzesOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: getAllQuizzesSchema,
  preHandler: [_fastify.authenticate],
  handler: getAllQuizzes
});

export const getMyQuizzesOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: getAllQuizzesSchema,
  preHandler: [_fastify.authenticate],
  handler: getUserQuizzes
});

export const updateQuizOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: updateQuizSchema,
  preHandler: [_fastify.authenticate],
  handler: updateQuiz
});

export const deleteQuizOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: deleteQuizSchema,
  preHandler: [_fastify.authenticate],
  handler: deleteQuiz
});
