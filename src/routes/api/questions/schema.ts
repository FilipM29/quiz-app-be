import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import {
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion
} from './handler';
import { QuestionType } from '@prisma/client';

// Question schema - API response format with options as string[]
export const Question = Type.Object({
  id: Type.String({ minLength: 1 }),
  roundId: Type.String({ minLength: 1 }),
  text: Type.String({ minLength: 1, maxLength: 1000 }),
  value: Type.Number({ minimum: 0, maximum: 100 }),
  type: Type.Enum(QuestionType),
  answer: Type.String({ minLength: 1, maxLength: 500 }),
  acceptableAnswers: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
  options: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
  range: Type.Optional(Type.Number({ minimum: 0 })),
  pictureUrl: Type.Optional(Type.String())
});

// POST /questions request body schema (options as strings)
const CreateQuestionBody = Type.Object({
  roundId: Type.String({ minLength: 1 }),
  text: Type.String({ minLength: 1, maxLength: 1000 }),
  value: Type.Number({ minimum: 0, maximum: 100 }),
  type: Type.Enum(QuestionType),
  answer: Type.String({ minLength: 1, maxLength: 500 }),
  acceptableAnswers: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
  options: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
  range: Type.Optional(Type.Number({ minimum: 0 })),
  pictureUrl: Type.Optional(Type.String())
});

// POST /questions schema
const createQuestionSchema: FastifySchema = {
  description: 'Create a new question',
  tags: ['questions'],
  body: CreateQuestionBody,

  response: {
    201: Question
  }
};

// GET /questions/:id schema
const getQuestionByIdSchema: FastifySchema = {
  description: 'Get a question by ID',
  tags: ['questions'],
  params: Type.Object({
    id: Type.String({
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_-]+$'
    })
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
    id: Type.String({
      minLength: 1,
      maxLength: 50,
      pattern: '^[a-zA-Z0-9_-]+$'
    })
  }),
  body: Type.Partial(
    Type.Pick(CreateQuestionBody, [
      'text',
      'value',
      'type',
      'answer',
      'acceptableAnswers',
      'options',
      'range',
      'pictureUrl'
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

// Export route options
export const createQuestionOpt = () => ({
  schema: createQuestionSchema,
  handler: createQuestion
});

export const getQuestionByIdOpt = () => ({
  schema: getQuestionByIdSchema,
  handler: getQuestionById
});

export const updateQuestionOpt = () => ({
  schema: updateQuestionSchema,
  handler: updateQuestion
});

export const deleteQuestionOpt = () => ({
  schema: deleteQuestionSchema,
  handler: deleteQuestion
});
