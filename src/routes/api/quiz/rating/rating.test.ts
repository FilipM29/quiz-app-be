jest.mock('firebase-admin');

import createServer from '~/server';
import type { FastifyInstance } from 'fastify';
import {
  QuizStatus,
  QuizType,
  QuizVisibility,
  type User
} from '@prisma/client';
import { createAuthHeaders } from '~/utils/test-helpers';

describe('rating endpoints', () => {
  let server: FastifyInstance;
  let user: User;
  let quizId: string;

  beforeAll(async () => {
    server = await createServer();
    // Create test user
    user = await server.prisma.user.create({
      data: {
        email: 'rating-test@example.com',
        firstName: 'Rating',
        lastName: 'Tester',
        firebaseId: 'rating-test-firebase-id'
      }
    });

    // Create test quiz
    const quiz = await server.prisma.quiz.create({
      data: {
        title: 'Test Quiz for Rating',
        description: 'Test quiz description',
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.PUBLISHED,
        quizVisibility: QuizVisibility.PUBLIC,
        authorId: user.id,
        numOfRounds: 1
      }
    });
    quizId = quiz.id;
  });

  afterAll(async () => {
    // Clean up
    await server.prisma.rating.deleteMany({
      where: { authorId: user.id }
    });
    await server.prisma.quiz.delete({ where: { id: quizId } });
    await server.prisma.user.delete({ where: { id: user.id } });
    await server.close();
  });

  describe('POST /quiz/:quizId/rating', () => {
    it('should create a new rating', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/api/quiz/rating/${quizId}`,
        headers: createAuthHeaders(user.firebaseId),
        payload: {
          value: 5,
          comment: 'Great quiz!'
        }
      });

      expect(response.statusCode).toEqual(200);
      const rating = JSON.parse(response.body);
      expect(rating.value).toEqual(5);
      expect(rating.comment).toEqual('Great quiz!');
      expect(rating.authorId).toEqual(user.id);
      expect(rating.quizId).toEqual(quizId);
    });

    it('should update existing rating', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/api/quiz/rating/${quizId}`,
        headers: createAuthHeaders(user.firebaseId),
        payload: {
          value: 4,
          comment: 'Updated rating'
        }
      });

      expect(response.statusCode).toEqual(200);
      const rating = JSON.parse(response.body);
      expect(rating.value).toEqual(4);
      expect(rating.comment).toEqual('Updated rating');
    });

    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: `/api/quiz/rating/${quizId}`,
        payload: {
          value: 5
        }
      });

      expect(response.statusCode).toEqual(401);
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/quiz/non-existent-id/rating',
        headers: createAuthHeaders(user.firebaseId),
        payload: {
          value: 5
        }
      });

      expect(response.statusCode).toEqual(404);
    });
  });

  describe('GET /quiz/:quizId/rating/me', () => {
    it("should get user's rating", async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/quiz/rating/${quizId}/me`,
        headers: createAuthHeaders(user.firebaseId)
      });

      expect(response.statusCode).toEqual(200);
      const rating = JSON.parse(response.body);
      expect(rating.value).toEqual(4); // From previous test
      expect(rating.authorId).toEqual(user.id);
    });

    it('should require authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/quiz/rating/${quizId}/me`
      });

      expect(response.statusCode).toEqual(401);
    });

    it("should return 404 when user hasn't rated", async () => {
      const newUser = await server.prisma.user.create({
        data: {
          email: 'new-user@example.com',
          firstName: 'New',
          lastName: 'User',
          firebaseId: 'new-user-firebase-id'
        }
      });

      const response = await server.inject({
        method: 'GET',
        url: `/api/quiz/rating/${quizId}/me`,
        headers: createAuthHeaders(newUser.firebaseId)
      });

      expect(response.statusCode).toEqual(404);

      // Clean up
      await server.prisma.user.delete({ where: { id: newUser.id } });
    });
  });
});
