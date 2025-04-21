import { Type } from '@sinclair/typebox';
import type { FastifySchema, FastifyInstance } from 'fastify';
import {
  createRound,
  getRoundById,
  updateRound,
  deleteRound,
  getQuestionsByRoundId
} from './handler';
import { Question } from '../questions/schema';

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
export const createRoundOpt = (_fastify: FastifyInstance) => ({
  schema: createRoundSchema,
  handler: createRound
});

export const getRoundByIdOpt = (_fastify: FastifyInstance) => ({
  schema: getRoundByIdSchema,
  handler: getRoundById
});

export const updateRoundOpt = (_fastify: FastifyInstance) => ({
  schema: updateRoundSchema,
  handler: updateRound
});

export const deleteRoundOpt = (_fastify: FastifyInstance) => ({
  schema: deleteRoundSchema,
  handler: deleteRound
});

export const getQuestionsByRoundIdOpt = (_fastify: FastifyInstance) => ({
  schema: getQuestionsByRoundIdSchema,
  handler: getQuestionsByRoundId
});
