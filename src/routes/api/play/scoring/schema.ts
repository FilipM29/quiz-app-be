import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import {
  getPendingSessions,
  getSessionWithAnswers,
  getPendingAnswers,
  scoreAnswer,
  getQuizSessions
} from './handler';

// Type definitions for request/response schemas
const UserInfo = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.Optional(Type.String())
});

const QuizInfo = Type.Object({
  id: Type.String(),
  title: Type.String(),
  pictureUrl: Type.Optional(Type.String())
});

const QuestionInfo = Type.Object({
  id: Type.String(),
  text: Type.String(),
  type: Type.String(),
  answer: Type.String(),
  value: Type.Number(),
  pictureUrl: Type.Optional(Type.String())
});

const PlayerAnswerDetail = Type.Object({
  id: Type.String(),
  questionId: Type.String(),
  userId: Type.Optional(Type.String()),
  guestIdentifier: Type.Optional(Type.String()),
  answer: Type.String(),
  submittedAt: Type.String({ format: 'date-time' }),
  scoringStatus: Type.Union([
    Type.Literal('PENDING'),
    Type.Literal('AUTO_SCORED'),
    Type.Literal('MANUALLY_SCORED')
  ]),
  isCorrect: Type.Optional(Type.Boolean()),
  points: Type.Optional(Type.Number()),
  timeToAnswer: Type.Optional(Type.Number()),
  teacherFeedback: Type.Optional(Type.String()),
  scoredById: Type.Optional(Type.String()),
  scoredAt: Type.Optional(Type.String({ format: 'date-time' })),
  question: QuestionInfo,
  user: Type.Optional(UserInfo),
  scoredBy: Type.Optional(
    Type.Object({
      id: Type.String(),
      firstName: Type.String(),
      lastName: Type.String()
    })
  )
});

// Route schemas
const getPendingSessionsSchema: FastifySchema = {
  description: 'Get all sessions with pending scoring',
  tags: ['scoring'],
  response: {
    200: Type.Array(
      Type.Object({
        id: Type.String(),
        quizId: Type.String(),
        hostId: Type.String(),
        playType: Type.String(),
        status: Type.String(),
        createdAt: Type.String({ format: 'date-time' }),
        startedAt: Type.Optional(Type.String({ format: 'date-time' })),
        finishedAt: Type.Optional(Type.String({ format: 'date-time' })),
        quiz: QuizInfo,
        host: UserInfo,
        _count: Type.Object({
          playerAnswers: Type.Number()
        })
      })
    ),
    500: Type.Object({
      message: Type.String()
    })
  }
};

const getSessionWithAnswersSchema: FastifySchema = {
  description: 'Get session details with all answers',
  tags: ['scoring'],
  params: Type.Object({
    sessionId: Type.String()
  }),
  response: {
    200: Type.Object({
      id: Type.String(),
      quizId: Type.String(),
      hostId: Type.String(),
      playType: Type.String(),
      status: Type.String(),
      createdAt: Type.String({ format: 'date-time' }),
      startedAt: Type.Optional(Type.String({ format: 'date-time' })),
      finishedAt: Type.Optional(Type.String({ format: 'date-time' })),
      quiz: QuizInfo,
      host: UserInfo,
      players: Type.Array(Type.Any()),
      playerAnswers: Type.Array(PlayerAnswerDetail)
    }),
    404: Type.Object({
      message: Type.String()
    }),
    500: Type.Object({
      message: Type.String()
    })
  }
};

const getPendingAnswersSchema: FastifySchema = {
  description: 'Get pending answers for a session',
  tags: ['scoring'],
  params: Type.Object({
    sessionId: Type.String()
  }),
  response: {
    200: Type.Array(PlayerAnswerDetail),
    500: Type.Object({
      message: Type.String()
    })
  }
};

const scoreAnswerSchema: FastifySchema = {
  description: 'Score a specific answer',
  tags: ['scoring'],
  params: Type.Object({
    answerId: Type.String()
  }),
  body: Type.Object({
    isCorrect: Type.Boolean(),
    points: Type.Number(),
    feedback: Type.Optional(Type.String())
  }),
  response: {
    200: PlayerAnswerDetail,
    401: Type.Object({
      message: Type.String()
    }),
    404: Type.Object({
      message: Type.String()
    }),
    500: Type.Object({
      message: Type.String()
    })
  }
};

const getQuizSessionsSchema: FastifySchema = {
  description: 'Get all sessions for a specific quiz',
  tags: ['scoring'],
  params: Type.Object({
    quizId: Type.String()
  }),
  response: {
    200: Type.Array(
      Type.Object({
        id: Type.String(),
        quizId: Type.String(),
        hostId: Type.String(),
        playType: Type.String(),
        status: Type.String(),
        createdAt: Type.String({ format: 'date-time' }),
        startedAt: Type.Optional(Type.String({ format: 'date-time' })),
        finishedAt: Type.Optional(Type.String({ format: 'date-time' })),
        host: UserInfo,
        _count: Type.Object({
          players: Type.Number(),
          playerAnswers: Type.Number()
        })
      })
    ),
    500: Type.Object({
      message: Type.String()
    })
  }
};

// Export route options
export const getPendingSessionsOpt = () => ({
  schema: getPendingSessionsSchema,
  handler: getPendingSessions
});

export const getSessionWithAnswersOpt = () => ({
  schema: getSessionWithAnswersSchema,
  handler: getSessionWithAnswers
});

export const getPendingAnswersOpt = () => ({
  schema: getPendingAnswersSchema,
  handler: getPendingAnswers
});

export const scoreAnswerOpt = () => ({
  schema: scoreAnswerSchema,
  handler: scoreAnswer
});

export const getQuizSessionsOpt = () => ({
  schema: getQuizSessionsSchema,
  handler: getQuizSessions
});
