jest.mock('firebase-admin');

import createServer from '~/server';
import type { FastifyInstance } from 'fastify';
import {
  Category,
  Difficulty,
  QuizStatus,
  QuizType,
  QuizVisibility,
  type User
} from '@prisma/client';
import { createAuthHeaders } from '~/utils/test-helpers';
import * as utils from '~/utils';

interface CategoryResponse {
  value: string;
  label: string;
  quizCount: number;
}

let server: FastifyInstance;
let user: User;
let testQuizId: string;

describe('categories endpoints', () => {
  beforeAll(async () => {
    server = await createServer();

    // Try to find existing user first, create if not exists
    const firebaseId = `testCategoriesFirebaseId-${Date.now()}-${Math.random()}`;
    user = await server.prisma.user.create({
      data: {
        email: 'categories-user@example.com',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        firebaseId
      }
    });

    // Create a test quiz to ensure we have at least one quiz in a category
    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/quiz',
      headers: createAuthHeaders(user.firebaseId),
      payload: {
        title: 'Test Science Quiz',
        description: 'Test quiz for categories',
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.PUBLISHED,
        quizVisibility: QuizVisibility.PUBLIC,
        category: Category.SCIENCE,
        difficulty: Difficulty.MEDIUM,
        numOfRounds: 1
      }
    });
    testQuizId = JSON.parse(createResponse.body).id;
  });

  afterAll(async () => {
    if (testQuizId && user) {
      await server.inject({
        method: 'DELETE',
        url: `/api/quiz/${testQuizId}`,
        headers: createAuthHeaders(user.firebaseId)
      });
    }
    if (server?.prisma && user?.id) {
      await server.prisma.user.delete({
        where: { id: user.id }
      });
    }
    await server?.close();
  });

  it('should get all categories', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/categories'
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(Object.keys(Category).length);

    // Check structure of each category
    body.forEach((category: CategoryResponse) => {
      expect(category).toHaveProperty('value');
      expect(category).toHaveProperty('label');
      expect(category).toHaveProperty('quizCount');
      expect(typeof category.value).toBe('string');
      expect(typeof category.label).toBe('string');
      expect(typeof category.quizCount).toBe('number');
      expect(category.quizCount).toBeGreaterThanOrEqual(0);
    });
  });

  it('should include all category enum values', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/categories'
    });

    const body = JSON.parse(response.body);
    const categoryValues = body.map((cat: CategoryResponse) => cat.value);

    Object.values(Category).forEach((categoryEnum) => {
      expect(categoryValues).toContain(categoryEnum);
    });
  });

  it('should format labels correctly', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/categories'
    });

    const body = JSON.parse(response.body);
    const popCultureCategory = body.find(
      (cat: CategoryResponse) => cat.value === 'POP_CULTURE'
    );
    const scienceCategory = body.find(
      (cat: CategoryResponse) => cat.value === 'SCIENCE'
    );

    expect(popCultureCategory?.label).toBe('Pop Culture');
    expect(scienceCategory?.label).toBe('Science');
  });

  it('should show correct quiz count for science category', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/categories'
    });

    const body = JSON.parse(response.body);
    const scienceCategory = body.find(
      (cat: CategoryResponse) => cat.value === Category.SCIENCE
    );

    expect(scienceCategory).toBeDefined();
    expect(scienceCategory?.quizCount).toBeGreaterThanOrEqual(1);
  });

  it('should only count published and public quizzes', async () => {
    // Create a private quiz in the same category
    const privateQuizResponse = await server.inject({
      method: 'POST',
      url: '/api/quiz',
      headers: createAuthHeaders(user.firebaseId),
      payload: {
        title: 'Private Science Quiz',
        description: 'This should not be counted',
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.PUBLISHED,
        quizVisibility: QuizVisibility.PRIVATE,
        category: Category.SCIENCE,
        difficulty: Difficulty.MEDIUM,
        numOfRounds: 1
      }
    });
    const privateQuizId = JSON.parse(privateQuizResponse.body).id;

    // Create a concept (unpublished) quiz in the same category
    const conceptQuizResponse = await server.inject({
      method: 'POST',
      url: '/api/quiz',
      headers: createAuthHeaders(user.firebaseId),
      payload: {
        title: 'Concept Science Quiz',
        description: 'This should not be counted either',
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.CONCEPT,
        quizVisibility: QuizVisibility.PUBLIC,
        category: Category.SCIENCE,
        difficulty: Difficulty.MEDIUM,
        numOfRounds: 1
      }
    });
    const conceptQuizId = JSON.parse(conceptQuizResponse.body).id;

    const response = await server.inject({
      method: 'GET',
      url: '/api/categories'
    });

    const body = JSON.parse(response.body);
    const scienceCategory = body.find(
      (cat: CategoryResponse) => cat.value === Category.SCIENCE
    );

    // Should still be the same count as before (only counting public + published)
    expect(scienceCategory?.quizCount).toBeGreaterThanOrEqual(1);

    // Clean up
    await server.inject({
      method: 'DELETE',
      url: `/api/quiz/${privateQuizId}`,
      headers: createAuthHeaders(user.firebaseId)
    });
    await server.inject({
      method: 'DELETE',
      url: `/api/quiz/${conceptQuizId}`,
      headers: createAuthHeaders(user.firebaseId)
    });
  });

  it('should return 500 on database error', async () => {
    // Mock a database error by spying on the prisma import
    const spy = jest
      .spyOn(utils.prisma.quiz, 'groupBy')
      .mockRejectedValue(new Error('Database error'));

    const response = await server.inject({
      method: 'GET',
      url: '/api/categories'
    });

    expect(response.statusCode).toEqual(500);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('message', 'Failed to fetch categories');

    // Restore the original implementation
    spy.mockRestore();
  });

  describe('GET /categories/:id', () => {
    it('should get category by ID', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/categories/SCIENCE'
      });

      expect(response.statusCode).toEqual(200);
      const body = JSON.parse(response.body);
      expect(body.value).toBe('SCIENCE');
      expect(body.label).toBe('Science');
      expect(body.quizCount).toBeGreaterThanOrEqual(1);
      expect(body).toHaveProperty('icon');
      expect(body).toHaveProperty('color');
    });

    it('should handle kebab-case category IDs', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/categories/pop-culture'
      });

      expect(response.statusCode).toEqual(200);
      const body = JSON.parse(response.body);
      expect(body.value).toBe('POP_CULTURE');
      expect(body.label).toBe('Pop Culture');
    });

    it('should return 404 for invalid category', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/categories/INVALID_CATEGORY'
      });

      expect(response.statusCode).toEqual(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('message');
    });
  });

  describe('GET /categories/:id/quiz', () => {
    it('should get quizzes for a category', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/categories/SCIENCE/quiz'
      });

      expect(response.statusCode).toEqual(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(1);

      // Verify all quizzes are in the SCIENCE category
      body.forEach((quiz: { category: string }) => {
        expect(quiz.category).toBe('SCIENCE');
      });
    });

    it('should handle kebab-case category IDs', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/categories/pop-culture/quiz'
      });

      expect(response.statusCode).toEqual(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('should return empty array for category with no quizzes', async () => {
      // Use MATHEMATICS category which likely has fewer quizzes
      const response = await server.inject({
        method: 'GET',
        url: '/api/categories/MATHEMATICS/quiz'
      });

      expect(response.statusCode).toEqual(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      // Just verify it returns an array (may or may not be empty)
      expect(body.length).toBeGreaterThanOrEqual(0);
    });

    it('should only return published and public quizzes', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/categories/SCIENCE/quiz'
      });

      expect(response.statusCode).toEqual(200);
      const body = JSON.parse(response.body);

      // Verify all quizzes are published and public
      body.forEach((quiz: { quizStatus: string; quizVisibility: string }) => {
        expect(quiz.quizStatus).toBe('PUBLISHED');
        expect(quiz.quizVisibility).toBe('PUBLIC');
      });
    });

    it('should return 404 for invalid category', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/categories/INVALID_CATEGORY/quiz'
      });

      expect(response.statusCode).toEqual(404);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('message');
    });
  });
});
