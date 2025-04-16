import {Type} from "@sinclair/typebox";
import {FastifyInstance, FastifySchema} from "fastify";
import {createQuiz, deleteQuiz, getAllQuizzes, getQuizById, updateQuiz} from "~/routes/api/quiz/handler";

const Quiz = Type.Object({
  id: Type.String(),
  name: Type.String(),
  createdAt: Type.String({format: 'date-time'}),
  updatedAt: Type.String({format: 'date-time'}),
  numOfRounds: Type.Number(),
  numOfPlays: Type.Number(),
  quizType: Type.String(),
  quizStatus: Type.String(),
  rating: Type.Number(),
  authorId: Type.String(),
})

const createQuizSchema: FastifySchema = {
  description: 'Create a new quiz',
  tags: ['quiz'],
  body: Type.Pick(Quiz, ['name', 'quizType', 'quizStatus', 'numOfRounds', 'authorId']),
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
    200: Quiz,
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

export const createQuizOpt = (_fastify: FastifyInstance) => ({
  schema: createQuizSchema,
  handler: createQuiz
});

export const getQuizByIdOpt = (_fastify: FastifyInstance) => ({
  schema: getQuizByIdSchema,
  handler: getQuizById
});

export const getAllQuizzesOpt = (_fastify: FastifyInstance) => ({
  schema: getAllQuizzesSchema,
  handler: getAllQuizzes
});

export const updateQuizOpt = (_fastify: FastifyInstance) => ({
  schema: updateQuizSchema,
  handler: updateQuiz
});

export const deleteQuizOpt = (_fastify: FastifyInstance) => ({
  schema: deleteQuizSchema,
  handler: deleteQuiz
});
