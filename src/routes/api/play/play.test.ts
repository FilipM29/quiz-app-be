jest.mock('firebase-admin');

import createServer from '~/server';
import type { FastifyInstance } from 'fastify';
import type { User } from '@prisma/client';
import { createAuthHeaders } from '~/utils/test-helpers';

let server: FastifyInstance;
let user: User;
let quizId: string;

describe('play routes', () => {
  beforeAll(async () => {
    server = await createServer();

    user = await server.prisma.user.create({
      data: {
        email: 'player@example.com',
        firstName: 'Test',
        lastName: 'Player',
        firebaseId: 'testPlayFirebaseId'
      }
    });

    // Create a test quiz with rounds and questions
    const quiz = await server.prisma.quiz.create({
      data: {
        title: 'Test Play Quiz',
        description: 'A test quiz for play testing',
        quizType: 'SLIDES',
        quizStatus: 'PUBLISHED',
        quizVisibility: 'PUBLIC',
        numOfRounds: 1,
        authorId: user.id
      }
    });

    quizId = quiz.id;

    // Create a round with questions
    const round = await server.prisma.quizRound.create({
      data: {
        title: 'Test Round',
        order: 1,
        quizId: quiz.id
      }
    });

    // Create test questions
    await server.prisma.question.create({
      data: {
        type: 'EXACT',
        value: 10,
        text: 'What is 2+2?',
        answer: '4',
        acceptableAnswers: ['4', 'four'],
        roundId: round.id
      }
    });

    await server.prisma.question.create({
      data: {
        type: 'OPTIONS',
        value: 15,
        text: 'What is the capital of France?',
        answer: 'Paris',
        acceptableAnswers: ['Paris'],
        roundId: round.id
      }
    });
  });

  afterAll(async () => {
    await server.prisma.user.delete({
      where: { id: user.id }
    });
  });

  describe('session management', () => {
    let sessionId: string;

    it('should start a new session', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/play/start',
        headers: createAuthHeaders(user.firebaseId),
        payload: {
          quizId,
          playType: 'SINGLE_ONLINE',
          settings: {
            timePerQuestion: 30,
            showCorrectAnswer: true
          }
        }
      });

      expect(response.statusCode).toEqual(201);
      const session = JSON.parse(response.body);
      expect(session.quizId).toEqual(quizId);
      expect(session.hostId).toEqual(user.id);
      expect(session.status).toEqual('waiting');
      expect(session.playType).toEqual('SINGLE_ONLINE');
      expect(session.players).toHaveLength(1);
      expect(session.players[0].userId).toEqual(user.id);

      sessionId = session.id;
    });

    it('should get session details', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/play/${sessionId}`
      });

      expect(response.statusCode).toEqual(200);
      const session = JSON.parse(response.body);
      expect(session.id).toEqual(sessionId);
      expect(session.status).toEqual('waiting');
    });

    it('should get session state for player', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/play/${sessionId}/state`,
        headers: createAuthHeaders(user.firebaseId)
      });

      expect(response.statusCode).toEqual(200);
      const state = JSON.parse(response.body);
      expect(state.session.id).toEqual(sessionId);
      expect(state.isHost).toBe(true);
      expect(state.currentQuestion).toBeUndefined(); // Not started yet
    });

    it('should get session players', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/play/${sessionId}/players`
      });

      expect(response.statusCode).toEqual(200);
      const players = JSON.parse(response.body);
      expect(players).toHaveLength(1);
      expect(players[0].userId).toEqual(user.id);
    });

    it('should start the game', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/api/play/${sessionId}/start-game`,
        headers: createAuthHeaders(user.firebaseId)
      });

      expect(response.statusCode).toEqual(200);
      const session = JSON.parse(response.body);
      expect(session.status).toEqual('active');
      expect(session.startedAt).toBeTruthy();
    });

    it('should submit an answer', async () => {
      // Get current session state to find question ID
      const stateResponse = await server.inject({
        method: 'GET',
        url: `/api/play/${sessionId}/state`,
        headers: createAuthHeaders(user.firebaseId)
      });

      const state = JSON.parse(stateResponse.body);
      const questionId = state.currentQuestion?.id;

      if (!questionId) {
        throw new Error('No question ID available for testing');
      }

      const response = await server.inject({
        method: 'POST',
        url: '/api/play/answer',
        headers: createAuthHeaders(user.firebaseId),
        payload: {
          sessionId,
          questionId,
          answer: '4'
        }
      });

      expect(response.statusCode).toEqual(200);
      const answer = JSON.parse(response.body);
      expect(answer.isCorrect).toBe(true);
      expect(answer.points).toEqual(10);
    });

    it('should advance to next question', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/api/play/${sessionId}/next`,
        headers: createAuthHeaders(user.firebaseId)
      });

      expect(response.statusCode).toEqual(200);
      const session = JSON.parse(response.body);
      expect(session.currentQuestionIndex).toEqual(1);
    });

    it('should finish the session', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/api/play/${sessionId}/finish`,
        headers: createAuthHeaders(user.firebaseId)
      });

      expect(response.statusCode).toEqual(200);
      const session = JSON.parse(response.body);
      expect(session.status).toEqual('finished');
      expect(session.finishedAt).toBeTruthy();
    });

    it('should get active sessions', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/play/sessions/active'
      });

      expect(response.statusCode).toEqual(200);
      const sessions = JSON.parse(response.body);
      expect(Array.isArray(sessions)).toBe(true);
      // Our session should not appear as it's finished
    });
  });

  describe('guest player support', () => {
    let guestSessionId: string;
    let guestUserId: string;
    let questionId: string;

    it('should allow guest to join a session', async () => {
      // First, create a session as host
      const startResponse = await server.inject({
        method: 'POST',
        url: '/api/play/start',
        headers: createAuthHeaders(user.firebaseId),
        payload: {
          quizId,
          playType: 'MULTI_ONLINE',
          settings: {
            timePerQuestion: 30,
            maxPlayers: 10
          }
        }
      });

      const session = JSON.parse(startResponse.body);
      guestSessionId = session.id;

      // Join as guest (no auth headers)
      const joinResponse = await server.inject({
        method: 'POST',
        url: '/api/play/join',
        payload: {
          sessionId: guestSessionId
        }
      });

      expect(joinResponse.statusCode).toEqual(200);
      const joinResult = JSON.parse(joinResponse.body);
      expect(joinResult.assignedUserId).toBeTruthy();
      expect(joinResult.assignedUserId).toContain('guest_');
      expect(joinResult.session.players).toHaveLength(2);

      const guestPlayer = joinResult.session.players.find(
        (p) => p.isGuest === true
      );
      expect(guestPlayer).toBeTruthy();
      expect(guestPlayer?.username).toContain('Guest');
      guestUserId = joinResult.assignedUserId;
    });

    it('should allow guest to view session state', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/play/${guestSessionId}/state`
      });

      expect(response.statusCode).toEqual(200);
      const state = JSON.parse(response.body);
      expect(state.session.id).toEqual(guestSessionId);
      expect(state.isHost).toBe(false);
    });

    it('should allow guest to submit answers', async () => {
      // Start the game first
      await server.inject({
        method: 'POST',
        url: `/api/play/${guestSessionId}/start-game`,
        headers: createAuthHeaders(user.firebaseId)
      });

      // Get current question
      const stateResponse = await server.inject({
        method: 'GET',
        url: `/api/play/${guestSessionId}/state`
      });

      const state = JSON.parse(stateResponse.body);
      questionId = state.currentQuestion?.id;

      // Submit answer as guest
      const answerResponse = await server.inject({
        method: 'POST',
        url: '/api/play/answer',
        payload: {
          sessionId: guestSessionId,
          questionId,
          answer: '4',
          userId: guestUserId
        }
      });

      expect(answerResponse.statusCode).toEqual(200);
      const answer = JSON.parse(answerResponse.body);
      expect(answer.isCorrect).toBe(true);
      expect(answer.points).toEqual(10);
    });

    it('should allow guest to leave session', async () => {
      const response = await server.inject({
        method: 'DELETE',
        url: `/api/play/${guestSessionId}/leave?userId=${guestUserId}`
      });

      expect(response.statusCode).toEqual(200);

      // Verify guest is removed
      const sessionResponse = await server.inject({
        method: 'GET',
        url: `/api/play/${guestSessionId}/players`
      });

      const players = JSON.parse(sessionResponse.body);
      const hasGuest = players.some((p) => p.userId === guestUserId);
      expect(hasGuest).toBe(false);
    });

    it('should not save results for guest players', async () => {
      // Count existing plays before the test
      const playsBefore = await server.prisma.quizPlay.count({
        where: {
          userId: user.id,
          quizId
        }
      });

      // Create another session with MULTI_ONLINE to allow guest to join
      const startResponse = await server.inject({
        method: 'POST',
        url: '/api/play/start',
        headers: createAuthHeaders(user.firebaseId),
        payload: {
          quizId,
          playType: 'MULTI_ONLINE',
          settings: {
            maxPlayers: 10
          }
        }
      });

      const session = JSON.parse(startResponse.body);
      const testSessionId = session.id;

      // Join as guest
      const joinResponse = await server.inject({
        method: 'POST',
        url: '/api/play/join',
        payload: {
          sessionId: testSessionId
        }
      });

      expect(joinResponse.statusCode).toEqual(200);
      const joinResult = JSON.parse(joinResponse.body);
      const testGuestId = joinResult.assignedUserId;

      // Verify guest ID is generated correctly
      expect(testGuestId).toBeDefined();
      expect(testGuestId).toContain('guest_');
      expect(testGuestId.startsWith(user.id)).toBe(false); // Not the user's real ID

      // Start game and finish
      await server.inject({
        method: 'POST',
        url: `/api/play/${testSessionId}/start-game`,
        headers: createAuthHeaders(user.firebaseId)
      });

      await server.inject({
        method: 'POST',
        url: `/api/play/${testSessionId}/finish`,
        headers: createAuthHeaders(user.firebaseId)
      });

      // Verify no quiz play record exists for guest ID
      const guestPlays = await server.prisma.quizPlay.findMany({
        where: {
          userId: testGuestId
        }
      });

      expect(guestPlays).toHaveLength(0);

      // But host should have exactly one more record than before
      const playsAfter = await server.prisma.quizPlay.count({
        where: {
          userId: user.id,
          quizId
        }
      });

      expect(playsAfter).toEqual(playsBefore + 1);
    });
  });

  describe('error handling', () => {
    it('should fail to start session without auth', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/play/start',
        payload: {
          quizId,
          playType: 'SINGLE_ONLINE'
        }
      });

      expect(response.statusCode).toEqual(401);
    });

    it('should fail to start session with invalid quiz ID', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/play/start',
        headers: createAuthHeaders(user.firebaseId),
        payload: {
          quizId: 'invalid-quiz-id',
          playType: 'SINGLE_ONLINE'
        }
      });

      expect(response.statusCode).toEqual(400);
    });

    it('should fail to get non-existent session', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/play/invalid-session-id'
      });

      expect(response.statusCode).toEqual(404);
    });
  });
});
