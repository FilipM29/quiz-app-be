import type { PlayType } from '@prisma/client';

export interface GameSession {
  id: string;
  quizId: string;
  hostId: string;
  status: 'waiting' | 'active' | 'finished';
  playType: PlayType;
  currentRoundIndex: number;
  currentQuestionIndex: number;
  players: SessionPlayer[];
  settings: SessionSettings;
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface SessionPlayer {
  userId: string;
  username: string;
  score: number;
  answers: PlayerAnswer[];
  isReady: boolean;
  isGuest: boolean;
  joinedAt: Date;
}

export interface PlayerAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
  submittedAt: Date;
  timeToAnswer: number; // in milliseconds
}

export interface SessionSettings {
  maxPlayers: number;
  timePerQuestion: number; // in seconds
  showCorrectAnswer: boolean;
  allowLateJoin: boolean;
  randomizeQuestions: boolean;
}

export interface StartSessionRequest {
  quizId: string;
  playType: PlayType;
  settings?: Partial<SessionSettings>;
}

export interface JoinSessionRequest {
  sessionId: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
  userId?: string; // Optional: for guests who need to pass their temporary ID
}

export interface SessionState {
  session: GameSession;
  currentQuestion?: {
    id: string;
    text: string;
    type: string;
    options?: string[];
    timeRemaining: number;
  };
  isHost: boolean;
}
