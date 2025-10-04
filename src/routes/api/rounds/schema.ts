import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import {
  createRound,
  getRoundById,
  updateRound,
  deleteRound,
  getQuestionsByRoundId
} from './handler';
import { QuestionType } from '@prisma/client';

// Inline Question schema with string[] options for round responses
const QuestionResponse = Type.Object({
  id: Type.String(),
  roundId: Type.String(),
  text: Type.String(),
  value: Type.Number(),
  type: Type.Enum(QuestionType),
  answer: Type.String(),
  acceptableAnswers: Type.Optional(Type.Array(Type.String())),
  options: Type.Optional(Type.Array(Type.String())),
  range: Type.Optional(Type.Number())
});

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
    200: Type.Array(QuestionResponse)
  }
};

// Export route options
export const createRoundOpt = () => ({
  schema: createRoundSchema,
  handler: createRound
});

export const getRoundByIdOpt = () => ({
  schema: getRoundByIdSchema,
  handler: getRoundById
});

export const updateRoundOpt = () => ({
  schema: updateRoundSchema,
  handler: updateRound
});

export const deleteRoundOpt = () => ({
  schema: deleteRoundSchema,
  handler: deleteRound
});

export const getQuestionsByRoundIdOpt = () => ({
  schema: getQuestionsByRoundIdSchema,
  handler: getQuestionsByRoundId
});
