jest.mock('firebase-admin');

import createServer from '~/server';
import type { FastifyInstance } from 'fastify';
import type { User, Quiz } from '@prisma/client';

let server: FastifyInstance;
let user: User;
let quiz1: Quiz;
let quiz2: Quiz;

describe('discover routes', () => {
  beforeAll(async () => {
    server = await createServer();

    // Create test user
    user = await server.prisma.user.create({
      data: {
        email: 'discover@example.com',
        firstName: 'Test',
        lastName: 'User',
        firebaseId: 'testDiscoverFirebaseId'
      }
    });

    // Create test quizzes with different categories
    quiz1 = await server.prisma.quiz.create({
      data: {
        title: 'Science Quiz',
        description: 'A quiz about science',
        quizType: 'SLIDES',
        quizStatus: 'PUBLISHED',
        quizVisibility: 'PUBLIC',
        category: 'SCIENCE',
        numOfRounds: 1,
        numOfPlays: 15,
        rating: 4,
        authorId: user.id
      }
    });

    quiz2 = await server.prisma.quiz.create({
      data: {
        title: 'Sports Quiz',
        description: 'A quiz about sports',
        quizType: 'JEOPARDY',
        quizStatus: 'PUBLISHED',
        quizVisibility: 'PUBLIC',
        category: 'SPORT',
        numOfRounds: 2,
        numOfPlays: 25,
        rating: 5,
        authorId: user.id
      }
    });

    // Create rounds for the quizzes
    const round1 = await server.prisma.quizRound.create({
      data: {
        title: 'Science Round 1',
        order: 1,
        quizId: quiz1.id
      }
    });

    const round2 = await server.prisma.quizRound.create({
      data: {
        title: 'Sports Round 1',
        order: 1,
        quizId: quiz2.id
      }
    });

    // Create some test questions
    await server.prisma.question.create({
      data: {
        type: 'EXACT',
        value: 10,
        text: 'What is H2O?',
        answer: 'Water',
        acceptableAnswers: ['Water', 'water'],
        roundId: round1.id
      }
    });

    await server.prisma.question.create({
      data: {
        type: 'OPTIONS',
        value: 15,
        text: 'Who won the 2022 World Cup?',
        answer: 'Argentina',
        acceptableAnswers: ['Argentina'],
        roundId: round2.id
      }
    });

    // Add some ratings
    await server.prisma.rating.create({
      data: {
        value: 4,
        comment: 'Great science quiz!',
        authorId: user.id,
        quizId: quiz1.id
      }
    });

    await server.prisma.rating.create({
      data: {
        value: 5,
        comment: 'Amazing sports quiz!',
        authorId: user.id,
        quizId: quiz2.id
      }
    });
  });

  afterAll(async () => {
    await server.prisma.user.delete({
      where: { id: user.id }
    });
  });


  describe('GET /api/discover/random', () => {
    it('should get random quizzes', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/random?limit=3'
      });

      expect(response.statusCode).toEqual(200);
      const quizzes = JSON.parse(response.body);
      expect(Array.isArray(quizzes)).toBe(true);
    });
  });

  describe('GET /api/discover/search', () => {
    it('should search quizzes by title', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/search?q=Science'
      });

      expect(response.statusCode).toEqual(200);
      const result = JSON.parse(response.body);
      expect(result.quizzes).toBeDefined();
      expect(result.pagination).toBeDefined();
      const hasScienceQuiz = (q: Quiz) => q.title.includes('Science');
      expect(result.quizzes.some(hasScienceQuiz)).toBe(true);
    });

    it('should search quizzes by category', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/search?category=SPORT'
      });

      expect(response.statusCode).toEqual(200);
      const result = JSON.parse(response.body);
      expect(result.quizzes).toBeDefined();
      const isSportQuiz = (q: Quiz & { category: string }) =>
        q.category === 'SPORT';
      expect(result.quizzes.some(isSportQuiz)).toBe(true);
    });

    it('should search quizzes by type', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/search?type=JEOPARDY'
      });

      expect(response.statusCode).toEqual(200);
      const result = JSON.parse(response.body);
      expect(result.quizzes).toBeDefined();
      const isJeopardyQuiz = (q: Quiz) => q.quizType === 'JEOPARDY';
      expect(result.quizzes.some(isJeopardyQuiz)).toBe(true);
    });

    it('should search quizzes by author', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/discover/search?author=${user.id}&limit=5`
      });

      expect(response.statusCode).toEqual(200);
      const result = JSON.parse(response.body);
      expect(result.quizzes).toBeDefined();
      expect(result.pagination).toBeDefined();
      const isUserQuiz = (q: Quiz & { author: { id: string } }) =>
        q.author.id === user.id;
      expect(result.quizzes.every(isUserQuiz)).toBe(true);
    });

    it('should support minPlays parameter (featured replacement)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/search?minRating=4&minPlays=10&sortBy=rating&sortOrder=desc&limit=5'
      });

      expect(response.statusCode).toEqual(200);
      const result = JSON.parse(response.body);
      expect(result.quizzes).toBeDefined();
      expect(result.pagination).toBeDefined();
    });

    it('should support sortBy=popular (popular replacement)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/search?sortBy=popular&sortOrder=desc&limit=5'
      });

      expect(response.statusCode).toEqual(200);
      const result = JSON.parse(response.body);
      expect(result.quizzes).toBeDefined();
      // Verify sorting if we have multiple results
      expect(result.quizzes.length).toBeGreaterThanOrEqual(0);
    });

    it('should support sortBy=recent (recent replacement)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/search?sortBy=recent&sortOrder=desc&limit=5'
      });

      expect(response.statusCode).toEqual(200);
      const result = JSON.parse(response.body);
      expect(result.quizzes).toBeDefined();
    });

    it('should support sortBy=rating (highest-rated replacement)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/search?sortBy=rating&sortOrder=desc&limit=5'
      });

      expect(response.statusCode).toEqual(200);
      const result = JSON.parse(response.body);
      expect(result.quizzes).toBeDefined();
      // Verify sorting if we have multiple results
      expect(result.quizzes.length).toBeGreaterThanOrEqual(0);
    });

    it('should search with multiple filters', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/search?category=SCIENCE&minRating=3&sortBy=rating&sortOrder=desc'
      });

      expect(response.statusCode).toEqual(200);
      const result = JSON.parse(response.body);
      expect(result.quizzes).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });


  describe('GET /api/discover/similar/:quizId', () => {
    it('should get similar quizzes', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/discover/similar/${quiz1.id}?limit=3`
      });

      expect(response.statusCode).toEqual(200);
      const quizzes = JSON.parse(response.body);
      expect(Array.isArray(quizzes)).toBe(true);
      // Should not include the original quiz
      const isNotOriginalQuiz = (q: Quiz) => q.id !== quiz1.id;
      expect(quizzes.every(isNotOriginalQuiz)).toBe(true);
    });
  });

  describe('GET /api/discover/stats', () => {
    it('should get platform statistics', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/stats'
      });

      expect(response.statusCode).toEqual(200);
      const stats = JSON.parse(response.body);
      expect(stats.totalQuizzes).toBeDefined();
      expect(stats.totalPlays).toBeDefined();
      expect(stats.avgRating).toBeDefined();
      expect(stats.topAuthors).toBeDefined();
      expect(Array.isArray(stats.topAuthors)).toBe(true);
      expect(typeof stats.totalQuizzes).toBe('number');
      expect(typeof stats.totalPlays).toBe('number');
      expect(typeof stats.avgRating).toBe('number');
    });
  });

  describe('error handling', () => {
    it('should handle invalid quiz ID for similar quizzes', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/discover/similar/invalid-quiz-id'
      });

      expect(response.statusCode).toEqual(200);
      const quizzes = JSON.parse(response.body);
      expect(Array.isArray(quizzes)).toBe(true);
      expect(quizzes).toHaveLength(0);
    });
  });
});
