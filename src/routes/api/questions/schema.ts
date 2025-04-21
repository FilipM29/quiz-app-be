import { Type } from '@sinclair/typebox';
import type { FastifySchema, FastifyInstance } from 'fastify';
import {
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from './handler';
import { QuestionType } from '@prisma/client';

// Question schema
export const Question = Type.Object({
  id: Type.String(),
  roundId: Type.String(),
  text: Type.String(),
  value: Type.Number(),
  type: Type.Enum(QuestionType),
  answer: Type.String(),
  acceptableAnswers: Type.Optional(Type.Array(Type.String())),
  options: Type.Optional(Type.Array(Type.String()))
});

// POST /questions schema
const createQuestionSchema: FastifySchema = {
  description: 'Create a new question',
  tags: ['questions'],
  body: Type.Omit(Question, ['id']),

  response: {
    201: Question
  }
};

// GET /questions/:id schema
const getQuestionByIdSchema: FastifySchema = {
  description: 'Get a question by ID',
  tags: ['questions'],
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: Question,
    404: Type.Object({
      message: Type.String()
    })
  }
};

// PUT /questions/:id schema
const updateQuestionSchema: FastifySchema = {
  description: 'Update a question',
  tags: ['questions'],
  params: Type.Object({
    id: Type.String()
  }),
  body: Type.Partial(
    Type.Pick(Question, [
      'text',
      'value',
      'type',
      'answer',
      'acceptableAnswers',
      'options'
    ])
  ),
  response: {
    200: Question,
    404: Type.Object({
      message: Type.String()
    })
  }
};

// DELETE /questions/:id schema
const deleteQuestionSchema: FastifySchema = {
  description: 'Delete a question',
  tags: ['questions'],
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

// Export route options
export const createQuestionOpt = (_fastify: FastifyInstance) => ({
  schema: createQuestionSchema,
  handler: createQuestion
});

export const getQuestionByIdOpt = (_fastify: FastifyInstance) => ({
  schema: getQuestionByIdSchema,
  handler: getQuestionById
});

export const updateQuestionOpt = (_fastify: FastifyInstance) => ({
  schema: updateQuestionSchema,
  handler: updateQuestion
});

export const deleteQuestionOpt = (_fastify: FastifyInstance) => ({
  schema: deleteQuestionSchema,
  handler: deleteQuestion
});
