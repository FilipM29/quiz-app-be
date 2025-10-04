import { Type } from '@sinclair/typebox';
import type { FastifySchema } from 'fastify';
import {
  startSession,
  joinSession,
  getSession,
  getSessionState,
  getSessionPlayers,
  submitAnswer,
  nextQuestion,
  startGame,
  finishSession,
  leaveSession,
  getActiveSessions
} from './handler';

// Type definitions for request/response schemas
const PlayType = Type.Union([
  Type.Literal('SINGLE_ONLINE'),
  Type.Literal('SINGLE_OFFLINE'),
  Type.Literal('MULTI_ONLINE'),
  Type.Literal('MULTI_OFFLINE')
]);

const SessionStatus = Type.Union([
  Type.Literal('waiting'),
  Type.Literal('active'),
  Type.Literal('finished')
]);

const SessionSettings = Type.Object({
  maxPlayers: Type.Number(),
  timePerQuestion: Type.Number(),
  showCorrectAnswer: Type.Boolean(),
  allowLateJoin: Type.Boolean(),
  randomizeQuestions: Type.Boolean()
});

const SessionPlayer = Type.Object({
  userId: Type.String(),
  username: Type.String(),
  score: Type.Number(),
  answers: Type.Array(
    Type.Object({
      questionId: Type.String(),
      answer: Type.String(),
      isCorrect: Type.Boolean(),
      points: Type.Number(),
      submittedAt: Type.String({ format: 'date-time' }),
      timeToAnswer: Type.Number()
    })
  ),
  isReady: Type.Boolean(),
  isGuest: Type.Boolean(),
  joinedAt: Type.String({ format: 'date-time' })
});

const GameSession = Type.Object({
  id: Type.String(),
  quizId: Type.String(),
  hostId: Type.String(),
  status: SessionStatus,
  playType: PlayType,
  currentRoundIndex: Type.Number(),
  currentQuestionIndex: Type.Number(),
  players: Type.Array(SessionPlayer),
  settings: SessionSettings,
  createdAt: Type.String({ format: 'date-time' }),
  startedAt: Type.Optional(Type.String({ format: 'date-time' })),
  finishedAt: Type.Optional(Type.String({ format: 'date-time' }))
});

// Route schemas
const startSessionSchema: FastifySchema = {
  description: 'Start a new game session',
  tags: ['play'],
  body: Type.Object({
    quizId: Type.String(),
    playType: PlayType,
    settings: Type.Optional(Type.Partial(SessionSettings))
  }),
  response: {
    201: GameSession,
    400: Type.Object({
      message: Type.String()
    }),
    401: Type.Object({
      message: Type.String()
    })
  }
};

const joinSessionSchema: FastifySchema = {
  description: 'Join an existing game session',
  tags: ['play'],
  body: Type.Object({
    sessionId: Type.String()
  }),
  response: {
    200: Type.Object({
      session: GameSession,
      assignedUserId: Type.String()
    }),
    400: Type.Object({
      message: Type.String()
    }),
    401: Type.Object({
      message: Type.String()
    })
  }
};

const getSessionSchema: FastifySchema = {
  description: 'Get session details',
  tags: ['play'],
  params: Type.Object({
    sessionId: Type.String()
  }),
  response: {
    200: GameSession,
    404: Type.Object({
      message: Type.String()
    })
  }
};

const getSessionStateSchema: FastifySchema = {
  description: 'Get current session state for a player',
  tags: ['play'],
  params: Type.Object({
    sessionId: Type.String()
  }),
  response: {
    200: Type.Object({
      session: GameSession,
      currentQuestion: Type.Optional(
        Type.Object({
          id: Type.String(),
          text: Type.String(),
          type: Type.String(),
          options: Type.Optional(Type.Array(Type.String())),
          timeRemaining: Type.Number()
        })
      ),
      isHost: Type.Boolean()
    }),
    401: Type.Object({
      message: Type.String()
    }),
    404: Type.Object({
      message: Type.String()
    })
  }
};

const getSessionPlayersSchema: FastifySchema = {
  description: 'Get all players in a session',
  tags: ['play'],
  params: Type.Object({
    sessionId: Type.String()
  }),
  response: {
    200: Type.Array(SessionPlayer),
    404: Type.Object({
      message: Type.String()
    })
  }
};

const submitAnswerSchema: FastifySchema = {
  description: 'Submit an answer to the current question',
  tags: ['play'],
  body: Type.Object({
    sessionId: Type.String(),
    questionId: Type.String(),
    answer: Type.String(),
    userId: Type.Optional(Type.String()) // For guests to pass their temporary ID
  }),
  response: {
    200: Type.Object({
      questionId: Type.String(),
      answer: Type.String(),
      isCorrect: Type.Boolean(),
      points: Type.Number(),
      submittedAt: Type.String({ format: 'date-time' }),
      timeToAnswer: Type.Number()
    }),
    400: Type.Object({
      message: Type.String()
    }),
    401: Type.Object({
      message: Type.String()
    })
  }
};

const nextQuestionSchema: FastifySchema = {
  description: 'Move to the next question (host only)',
  tags: ['play'],
  params: Type.Object({
    sessionId: Type.String()
  }),
  response: {
    200: GameSession,
    400: Type.Object({
      message: Type.String()
    }),
    401: Type.Object({
      message: Type.String()
    })
  }
};

const startGameSchema: FastifySchema = {
  description: 'Start the game (host only)',
  tags: ['play'],
  params: Type.Object({
    sessionId: Type.String()
  }),
  response: {
    200: GameSession,
    400: Type.Object({
      message: Type.String()
    }),
    401: Type.Object({
      message: Type.String()
    })
  }
};

const finishSessionSchema: FastifySchema = {
  description: 'Finish the session and save results',
  tags: ['play'],
  params: Type.Object({
    sessionId: Type.String()
  }),
  response: {
    200: GameSession,
    400: Type.Object({
      message: Type.String()
    }),
    401: Type.Object({
      message: Type.String()
    })
  }
};

const leaveSessionSchema: FastifySchema = {
  description: 'Leave a session',
  tags: ['play'],
  params: Type.Object({
    sessionId: Type.String()
  }),
  querystring: Type.Object({
    userId: Type.Optional(Type.String()) // For guests to pass their temporary ID
  }),
  response: {
    200: Type.Object({
      message: Type.String()
    }),
    400: Type.Object({
      message: Type.String()
    }),
    401: Type.Object({
      message: Type.String()
    })
  }
};

const getActiveSessionsSchema: FastifySchema = {
  description: 'Get all active sessions',
  tags: ['play'],
  response: {
    200: Type.Array(GameSession),
    500: Type.Object({
      message: Type.String()
    })
  }
};

// Export route options
export const startSessionOpt = () => ({
  schema: startSessionSchema,
  handler: startSession
});

export const joinSessionOpt = () => ({
  schema: joinSessionSchema,
  handler: joinSession
});

export const getSessionOpt = () => ({
  schema: getSessionSchema,
  handler: getSession
});

export const getSessionStateOpt = () => ({
  schema: getSessionStateSchema,
  handler: getSessionState
});

export const getSessionPlayersOpt = () => ({
  schema: getSessionPlayersSchema,
  handler: getSessionPlayers
});

export const submitAnswerOpt = () => ({
  schema: submitAnswerSchema,
  handler: submitAnswer
});

export const nextQuestionOpt = () => ({
  schema: nextQuestionSchema,
  handler: nextQuestion
});

export const startGameOpt = () => ({
  schema: startGameSchema,
  handler: startGame
});

export const finishSessionOpt = () => ({
  schema: finishSessionSchema,
  handler: finishSession
});

export const leaveSessionOpt = () => ({
  schema: leaveSessionSchema,
  handler: leaveSession
});

export const getActiveSessionsOpt = () => ({
  schema: getActiveSessionsSchema,
  handler: getActiveSessions
});
