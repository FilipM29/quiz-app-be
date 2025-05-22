import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import {
  createRound,
  getRoundById,
  updateRound,
  deleteRound,
  getQuestionsByRoundId
} from './handler';
import { Question } from '../questions/schema';
import {QuizAppFastifyInstance} from "~/models/fastify";

// Round schema
const Round = Type.Object({
  id: Type.String(),
  quizId: Type.String(),
  order: Type.Number(),
  title: Type.String()
});

// POST /rounds schema
const createRoundSchema: FastifySchema = {
  description: 'Create a new round',
  tags: ['rounds'],
  body: Type.Pick(Round, ['quizId', 'order', 'title']),
  response: {
    201: Round
  }
};

// GET /rounds/:id schema
const getRoundByIdSchema: FastifySchema = {
  description: 'Get a round by ID',
  tags: ['rounds'],
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: Round,
    404: Type.Object({
      message: Type.String()
    })
  }
};

// PUT /rounds/:id schema
const updateRoundSchema: FastifySchema = {
  description: 'Update a round',
  tags: ['rounds'],
  params: Type.Object({
    id: Type.String()
  }),
  body: Type.Pick(Round, ['title', 'order']),
  response: {
    200: Round,
    404: Type.Object({
      message: Type.String()
    })
  }
};

// DELETE /rounds/:id schema
const deleteRoundSchema: FastifySchema = {
  description: 'Delete a round',
  tags: ['rounds'],
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

// GET /questions/round/:roundId schema
const getQuestionsByRoundIdSchema: FastifySchema = {
  description: 'Get all questions by round ID',
  tags: ['questions'],
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: Type.Array(Question)
  }
};

// Export route options
export const createRoundOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: createRoundSchema,
  preHandler: [_fastify.authenticate],
  handler: createRound
});

export const getRoundByIdOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: getRoundByIdSchema,
  preHandler: [_fastify.authenticate],
  handler: getRoundById
});

export const updateRoundOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: updateRoundSchema,
    preHandler: [_fastify.authenticate],
  handler: updateRound
});

export const deleteRoundOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: deleteRoundSchema,
    preHandler: [_fastify.authenticate],
  handler: deleteRound
});

export const getQuestionsByRoundIdOpt = (_fastify: QuizAppFastifyInstance) => ({
  schema: getQuestionsByRoundIdSchema,
    preHandler: [_fastify.authenticate],
  handler: getQuestionsByRoundId
});
