import { Category } from '@prisma/client';
import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import {
  getAllCategories,
  getCategoryById,
  getQuizzesByCategory
} from '~/routes/api/categories/handler';

const CategorySchema = Type.Object({
  value: Type.Enum(Category),
  label: Type.String(),
  quizCount: Type.Number({ minimum: 0 }),
  icon: Type.String({ format: 'uri' }),
  color: Type.String({ pattern: '^#[0-9A-Fa-f]{6}$' })
});

const QuizSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  description: Type.String(),
  pictureUrl: Type.Optional(Type.String()),
  category: Type.Enum(Category),
  quizType: Type.String(),
  quizStatus: Type.String(),
  quizVisibility: Type.String(),
  numOfRounds: Type.Number(),
  numOfPlays: Type.Number(),
  rating: Type.Number(),
  authorId: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String()
});

const getAllCategoriesSchema: FastifySchema = {
  description: 'Get all available categories',
  tags: ['categories'],
  response: {
    200: Type.Array(CategorySchema)
  }
};

const getCategoryByIdSchema: FastifySchema = {
  description: 'Get category by ID',
  tags: ['categories'],
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: CategorySchema,
    404: Type.Object({
      message: Type.String()
    })
  }
};

const getQuizzesByCategorySchema: FastifySchema = {
  description: 'Get all quizzes for a category',
  tags: ['categories'],
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: Type.Array(QuizSchema),
    404: Type.Object({
      message: Type.String()
    })
  }
};

export const getAllCategoriesOpt = () => ({
  schema: getAllCategoriesSchema,
  handler: getAllCategories
});

export const getCategoryByIdOpt = () => ({
  schema: getCategoryByIdSchema,
  handler: getCategoryById
});

export const getQuizzesByCategoryOpt = () => ({
  schema: getQuizzesByCategorySchema,
  handler: getQuizzesByCategory
});
