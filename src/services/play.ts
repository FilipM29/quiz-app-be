import { prisma } from '~/utils';
import { NotFoundError, BadRequestError } from '~/models';
import { messages } from '~/resources';
import type {
  GameSession,
  PlayerAnswer,
  SessionSettings,
  StartSessionRequest,
  JoinSessionRequest,
  SubmitAnswerRequest,
  SessionState
} from '~/types/play';
import type { QuizResult } from '@prisma/client';

class PlaySessionService {
  private static sessions = new Map<string, GameSession>();
  private static guestCounters = new Map<string, number>(); // Track guest count per session

  private static generateGuestId(sessionId: string): string {
    return `guest_${sessionId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getNextGuestUsername(sessionId: string): string {
    const currentCount = this.guestCounters.get(sessionId) || 0;
    const nextCount = currentCount + 1;
    this.guestCounters.set(sessionId, nextCount);
    return `Guest ${nextCount}`;
  }

  static async startSession(
    hostId: string,
    request: StartSessionRequest
  ): Promise<GameSession> {
    // Verify quiz exists and get its structure
    const quiz = await prisma.quiz.findUnique({
      where: { id: request.quizId },
      include: {
        rounds: {
          include: {
            questions: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!quiz) {
      throw new NotFoundError(messages.notFound('Quiz', request.quizId));
    }

    if (quiz.rounds.length === 0) {
      throw new BadRequestError('Quiz must have at least one round');
    }

    const defaultSettings: SessionSettings = {
      maxPlayers: request.playType.includes('MULTI') ? 10 : 1,
      timePerQuestion: 30,
      showCorrectAnswer: true,
      allowLateJoin: false,
      randomizeQuestions: false
    };

    const settings = { ...defaultSettings, ...request.settings };

    // For MULTI modes, persist session to database
    let sessionId: string;
    if (
      request.playType === 'MULTI_OFFLINE' ||
      request.playType === 'MULTI_ONLINE'
    ) {
      const dbSession = await prisma.playSession.create({
        data: {
          quizId: request.quizId,
          hostId,
          playType: request.playType,
          status: 'WAITING',
          currentRound: 0,
          currentQuestion: 0,
          maxPlayers: settings.maxPlayers,
          timePerQuestion: settings.timePerQuestion,
          showCorrectAnswer: settings.showCorrectAnswer,
          allowLateJoin: settings.allowLateJoin,
          randomizeQuestions: settings.randomizeQuestions
        }
      });
      sessionId = dbSession.id;
    } else {
      // For SINGLE modes, use generated ID
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    const session: GameSession = {
      id: sessionId,
      quizId: request.quizId,
      hostId,
      status: 'waiting',
      playType: request.playType,
      currentRoundIndex: 0,
      currentQuestionIndex: 0,
      players: [],
      settings,
      createdAt: new Date()
    };

    // Add host as first player
    const hostUser = await prisma.user.findUnique({
      where: { id: hostId }
    });

    if (hostUser) {
      const playerData = {
        userId: hostId,
        username: `${hostUser.firstName} ${hostUser.lastName}`,
        score: 0,
        answers: [],
        isReady: true,
        isGuest: false,
        joinedAt: new Date()
      };

      session.players.push(playerData);

      // Persist player to database for MULTI modes
      if (
        request.playType === 'MULTI_OFFLINE' ||
        request.playType === 'MULTI_ONLINE'
      ) {
        await prisma.sessionPlayer.create({
          data: {
            playSessionId: sessionId,
            userId: hostId,
            username: playerData.username,
            score: 0,
            isGuest: false,
            isReady: true
          }
        });
      }
    }

    this.sessions.set(sessionId, session);
    return session;
  }

  static async joinSession(
    userId: string | null,
    request: JoinSessionRequest
  ): Promise<{ session: GameSession; assignedUserId: string }> {
    const session = this.sessions.get(request.sessionId);

    if (!session) {
      throw new NotFoundError(messages.notFound('Session', request.sessionId));
    }

    if (session.status === 'finished') {
      throw new BadRequestError('Cannot join finished session');
    }

    if (session.status === 'active' && !session.settings.allowLateJoin) {
      throw new BadRequestError('Cannot join session in progress');
    }

    if (session.players.length >= session.settings.maxPlayers) {
      throw new BadRequestError('Session is full');
    }

    let playerId: string;
    let username: string;
    let isGuest: boolean;

    if (userId) {
      // Authenticated user
      // Check if user already in session
      if (session.players.some((p) => p.userId === userId)) {
        throw new BadRequestError('User already in session');
      }

      // Get user info
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundError(messages.notFound('User', userId));
      }

      playerId = userId;
      username = `${user.firstName} ${user.lastName}`;
      isGuest = false;
    } else {
      // Guest user
      playerId = this.generateGuestId(request.sessionId);
      username = this.getNextGuestUsername(request.sessionId);
      isGuest = true;
    }

    // Add player to session
    const playerData = {
      userId: playerId,
      username,
      score: 0,
      answers: [],
      isReady: false,
      isGuest,
      joinedAt: new Date()
    };

    session.players.push(playerData);

    // Persist player to database for MULTI modes
    if (
      session.playType === 'MULTI_OFFLINE' ||
      session.playType === 'MULTI_ONLINE'
    ) {
      await prisma.sessionPlayer.create({
        data: {
          playSessionId: request.sessionId,
          userId: isGuest ? null : playerId,
          guestIdentifier: isGuest ? playerId : null,
          username,
          score: 0,
          isGuest,
          isReady: false
        }
      });
    }

    return { session, assignedUserId: playerId };
  }

  static async getSession(sessionId: string): Promise<GameSession> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundError(messages.notFound('Session', sessionId));
    }

    return session;
  }

  static async getSessionState(
    sessionId: string,
    userId: string | null
  ): Promise<SessionState> {
    const session = await this.getSession(sessionId);
    const isHost = userId ? session.hostId === userId : false;

    // Get current question if session is active
    let currentQuestion;
    if (session.status === 'active') {
      const quiz = await prisma.quiz.findUnique({
        where: { id: session.quizId },
        include: {
          rounds: {
            include: {
              questions: {
                include: {
                  options: true
                }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      });

      if (
        quiz &&
        quiz.rounds[session.currentRoundIndex]?.questions[
          session.currentQuestionIndex
        ]
      ) {
        const question =
          quiz.rounds[session.currentRoundIndex]!.questions[
            session.currentQuestionIndex
          ]!;
        currentQuestion = {
          id: question.id,
          text: question.text,
          type: question.type,
          options: question.options.map((opt) => opt.text),
          timeRemaining: session.settings.timePerQuestion
        };
      }
    }

    return {
      session,
      currentQuestion,
      isHost
    };
  }

  static async submitAnswer(
    userId: string | null,
    request: SubmitAnswerRequest
  ): Promise<PlayerAnswer> {
    const session = this.sessions.get(request.sessionId);

    if (!session) {
      throw new NotFoundError(messages.notFound('Session', request.sessionId));
    }

    if (session.status !== 'active') {
      throw new BadRequestError('Session is not active');
    }

    if (!userId) {
      throw new BadRequestError('User ID required to submit answer');
    }

    const player = session.players.find((p) => p.userId === userId);
    if (!player) {
      throw new BadRequestError('User not in session');
    }

    // Check if already answered this question
    if (player.answers.some((a) => a.questionId === request.questionId)) {
      throw new BadRequestError('Already answered this question');
    }

    // Get question details
    const question = await prisma.question.findUnique({
      where: { id: request.questionId }
    });

    if (!question) {
      throw new NotFoundError(
        messages.notFound('Question', request.questionId)
      );
    }

    // Determine if answer needs manual scoring (only for offline multiplayer)
    const needsManualScoring = session.playType === 'MULTI_OFFLINE';

    // Validate answer and calculate score (only if not requiring manual scoring)
    let isCorrect: boolean | null = null;
    let points: number | null = null;
    let scoringStatus: 'PENDING' | 'AUTO_SCORED' = 'PENDING';

    if (!needsManualScoring) {
      // Auto-score the answer
      isCorrect = false;
      switch (question.type) {
        case 'EXACT':
          isCorrect =
            question.answer.toLowerCase().trim() ===
            request.answer.toLowerCase().trim();
          break;
        case 'OPTIONS':
          isCorrect = question.answer === request.answer;
          break;
        case 'INTERVAL': {
          const answerNum = parseFloat(request.answer);
          const correctNum = parseFloat(question.answer);
          const range = question.range || 0;
          isCorrect = Math.abs(answerNum - correctNum) <= range;
          break;
        }
      }

      points = isCorrect ? question.value : 0;
      scoringStatus = 'AUTO_SCORED';
    }

    const playerAnswer: PlayerAnswer = {
      questionId: request.questionId,
      answer: request.answer,
      isCorrect: isCorrect!,
      points: points!,
      submittedAt: new Date(),
      timeToAnswer: 0 // TODO: Calculate based on question start time
    };

    player.answers.push(playerAnswer);
    if (points !== null) {
      player.score += points;
    }

    // Persist answer to database for MULTI modes
    if (
      session.playType === 'MULTI_OFFLINE' ||
      session.playType === 'MULTI_ONLINE'
    ) {
      await prisma.playerAnswer.create({
        data: {
          playSessionId: request.sessionId,
          questionId: request.questionId,
          userId: player.isGuest ? null : userId,
          guestIdentifier: player.isGuest ? userId : null,
          answer: request.answer,
          scoringStatus,
          isCorrect,
          points,
          timeToAnswer: 0
        }
      });

      // Update player score in database
      await prisma.sessionPlayer.updateMany({
        where: {
          playSessionId: request.sessionId,
          ...(player.isGuest ? { guestIdentifier: userId } : { userId })
        },
        data: {
          score: player.score
        }
      });
    }

    return playerAnswer;
  }

  static async nextQuestion(
    sessionId: string,
    hostId: string
  ): Promise<GameSession> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundError(messages.notFound('Session', sessionId));
    }

    if (session.hostId !== hostId) {
      throw new BadRequestError('Only host can advance questions');
    }

    if (session.status !== 'active') {
      throw new BadRequestError('Session is not active');
    }

    // Get quiz structure
    const quiz = await prisma.quiz.findUnique({
      where: { id: session.quizId },
      include: {
        rounds: {
          include: {
            questions: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!quiz) {
      throw new NotFoundError(messages.notFound('Quiz', session.quizId));
    }

    const currentRound = quiz.rounds[session.currentRoundIndex]!;

    // Move to next question
    if (session.currentQuestionIndex < currentRound.questions.length - 1) {
      session.currentQuestionIndex++;
    } else if (session.currentRoundIndex < quiz.rounds.length - 1) {
      // Move to next round
      session.currentRoundIndex++;
      session.currentQuestionIndex = 0;
    } else {
      // Quiz finished
      return this.finishSession(sessionId, hostId);
    }

    return session;
  }

  static async finishSession(
    sessionId: string,
    hostId: string
  ): Promise<GameSession> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundError(messages.notFound('Session', sessionId));
    }

    if (session.hostId !== hostId) {
      throw new BadRequestError('Only host can finish session');
    }

    // Check if session is already finished (idempotency)
    if (session.status === 'finished') {
      return session;
    }

    session.status = 'finished';
    session.finishedAt = new Date();

    // Update session status in database for MULTI modes
    if (
      session.playType === 'MULTI_OFFLINE' ||
      session.playType === 'MULTI_ONLINE'
    ) {
      await prisma.playSession.update({
        where: { id: sessionId },
        data: {
          status: 'FINISHED',
          finishedAt: new Date()
        }
      });
    }

    // Save results to database for all authenticated players (not guests)
    // Detailed answers are in PlayerAnswer table for all modes
    for (const player of session.players) {
      if (!player.isGuest) {
        await prisma.quizPlay.create({
          data: {
            userId: player.userId,
            quizId: session.quizId,
            type: session.playType,
            score: player.score,
            result: 'FINISHED' as QuizResult
          }
        });
      }
    }

    // Update quiz play count
    await prisma.quiz.update({
      where: { id: session.quizId },
      data: {
        numOfPlays: {
          increment: 1
        }
      }
    });

    return session;
  }

  static async startGame(
    sessionId: string,
    hostId: string
  ): Promise<GameSession> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundError(messages.notFound('Session', sessionId));
    }

    if (session.hostId !== hostId) {
      throw new BadRequestError('Only host can start game');
    }

    if (session.status !== 'waiting') {
      throw new BadRequestError('Session is not in waiting state');
    }

    if (session.players.length === 0) {
      throw new BadRequestError('No players in session');
    }

    session.status = 'active';
    session.startedAt = new Date();

    // Update session status in database for MULTI modes
    if (
      session.playType === 'MULTI_OFFLINE' ||
      session.playType === 'MULTI_ONLINE'
    ) {
      await prisma.playSession.update({
        where: { id: sessionId },
        data: {
          status: 'ACTIVE',
          startedAt: new Date()
        }
      });
    }

    return session;
  }

  static async leaveSession(
    sessionId: string,
    userId: string | null
  ): Promise<void> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundError(messages.notFound('Session', sessionId));
    }

    if (!userId) {
      throw new BadRequestError('User ID required to leave session');
    }

    const playerIndex = session.players.findIndex((p) => p.userId === userId);
    if (playerIndex === -1) {
      throw new BadRequestError('User not in session');
    }

    session.players.splice(playerIndex, 1);

    // If host leaves, end session or transfer to another player
    if (session.hostId === userId) {
      if (session.players.length > 0) {
        session.hostId = session.players[0]!.userId;
      } else {
        this.sessions.delete(sessionId);
      }
    }
  }

  static getAllActiveSessions(): GameSession[] {
    return [...this.sessions.values()].filter(
      (s) => s.status === 'waiting' || s.status === 'active'
    );
  }
}

export { PlaySessionService };
