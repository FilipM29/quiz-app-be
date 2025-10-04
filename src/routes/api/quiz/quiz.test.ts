// Mock Firebase Admin at the very top
jest.mock('firebase-admin');

import createServer from '~/server';
import type { FastifyInstance } from 'fastify';
import { QuizStatus, QuizType, Difficulty, type User } from '@prisma/client';
import { createAuthHeaders } from '~/utils/test-helpers';

let server: FastifyInstance;
let user: User;
let otherUser: User;
let currentQuizId: string;
const quizTitle = 'TestQuiz';

// Access the mocked admin if needed for test assertions
// const mockedAdmin = jest.mocked(admin);

describe('quiz endpoints', () => {
  beforeAll(async () => {
    server = await createServer();
    user = await server.prisma.user.create({
      data: {
        email: 'user@example.com',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        firebaseId: 'testQuizFirebaseId'
      }
    });

    // Create another user for authorization testing
    otherUser = await server.prisma.user.create({
      data: {
        email: 'other@example.com',
        firstName: 'otherFirstName',
        lastName: 'otherLastName',
        firebaseId: 'otherTestFirebaseId'
      }
    });
  });

  afterAll(async () => {
    await server.prisma.user.delete({
      where: { id: user.id }
    });
    await server.prisma.user.delete({
      where: { id: otherUser.id }
    });
  });

  it('should create a quiz with authentication', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/quiz',
      headers: createAuthHeaders(user.firebaseId),
      payload: {
        title: quizTitle,
        description: 'This is a test quiz',
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.PUBLISHED,
        quizVisibility: 'PUBLIC',
        category: 'SCIENCE',
        difficulty: Difficulty.MEDIUM,
        numOfRounds: 5
        // authorId is now automatically set from authenticated user
      }
    });

    expect(response.statusCode).toEqual(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body.title).toEqual(quizTitle);
    expect(body.numOfRounds).toEqual(5);
    expect(body.authorId).toEqual(user.id);
    currentQuizId = body.id;
  });

  it('should fail to create quiz without authentication', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/quiz',
      payload: {
        title: 'Unauthorized Quiz',
        description: 'This should fail',
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.PUBLISHED,
        quizVisibility: 'PUBLIC',
        category: 'OTHER',
        difficulty: Difficulty.MEDIUM,
        numOfRounds: 3
      }
    });

    expect(response.statusCode).toEqual(401);
  });

  it('should get a quiz by ID', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/quiz/${currentQuizId}`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.id).toEqual(currentQuizId);
    expect(body.title).toEqual(quizTitle);
  });

  it('should update a quiz with authentication', async () => {
    const updatedTitle = 'UpdatedTestQuiz';
    const response = await server.inject({
      method: 'PUT',
      url: `/api/quiz/${currentQuizId}`,
      headers: createAuthHeaders(user.firebaseId),
      payload: {
        title: updatedTitle,
        description: 'Updated description',
        quizType: QuizType.JEOPARDY
      }
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.id).toEqual(currentQuizId);
    expect(body.title).toEqual(updatedTitle);
    expect(body.quizType).toEqual(QuizType.JEOPARDY);
    expect(body.quizStatus).toEqual(QuizStatus.PUBLISHED);
  });

  it('should fail to update quiz without authentication', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/api/quiz/${currentQuizId}`,
      payload: {
        title: 'Should Fail'
      }
    });

    expect(response.statusCode).toEqual(401);
  });

  it('should delete a quiz with authentication', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/quiz/${currentQuizId}`,
      headers: createAuthHeaders(user.firebaseId)
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('Quiz deleted!');
  });

  it('should fail to delete quiz without authentication', async () => {
    // Create a new quiz first since we deleted the previous one
    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/quiz',
      headers: createAuthHeaders(user.firebaseId),
      payload: {
        title: 'To Delete Quiz',
        description: 'Quiz to test deletion',
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.CONCEPT,
        quizVisibility: 'PUBLIC',
        category: 'OTHER',
        difficulty: Difficulty.MEDIUM,
        numOfRounds: 2
      }
    });
    const newQuizId = JSON.parse(createResponse.body).id;

    const response = await server.inject({
      method: 'DELETE',
      url: `/api/quiz/${newQuizId}`
    });

    expect(response.statusCode).toEqual(401);

    // Clean up - delete the quiz with proper auth
    await server.inject({
      method: 'DELETE',
      url: `/api/quiz/${newQuizId}`,
      headers: createAuthHeaders(user.firebaseId)
    });
  });

  it('should get rounds by quiz ID', async () => {
    // Create a new quiz since previous one was deleted
    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/quiz',
      headers: createAuthHeaders(user.firebaseId),
      payload: {
        title: 'Rounds Test Quiz',
        description: 'Quiz for testing rounds',
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.CONCEPT,
        quizVisibility: 'PUBLIC',
        category: 'OTHER',
        difficulty: Difficulty.MEDIUM,
        numOfRounds: 1
      }
    });
    const quizForRounds = JSON.parse(createResponse.body).id;

    const response = await server.inject({
      method: 'GET',
      url: `/api/quiz/${quizForRounds}/rounds`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0); // Assuming no rounds exist initially
  });

  it('should prevent other users from modifying quiz', async () => {
    // Create a quiz with the first user
    const createResponse = await server.inject({
      method: 'POST',
      url: '/api/quiz',
      headers: createAuthHeaders(user.firebaseId),
      payload: {
        title: 'Owner Quiz',
        description: 'Quiz to test ownership',
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.CONCEPT,
        quizVisibility: 'PUBLIC',
        category: 'OTHER',
        difficulty: Difficulty.MEDIUM,
        numOfRounds: 1
      }
    });
    const ownerQuizId = JSON.parse(createResponse.body).id;

    // Try to update with another user - should fail
    const updateResponse = await server.inject({
      method: 'PUT',
      url: `/api/quiz/${ownerQuizId}`,
      headers: createAuthHeaders(otherUser.firebaseId),
      payload: {
        data: {
          title: 'Hacked Title'
        }
      }
    });

    expect(updateResponse.statusCode).toEqual(403);

    // Try to delete with another user - should fail
    const deleteResponse = await server.inject({
      method: 'DELETE',
      url: `/api/quiz/${ownerQuizId}`,
      headers: createAuthHeaders(otherUser.firebaseId)
    });

    expect(deleteResponse.statusCode).toEqual(403);

    // Clean up - delete with proper owner
    await server.inject({
      method: 'DELETE',
      url: `/api/quiz/${ownerQuizId}`,
      headers: createAuthHeaders(user.firebaseId)
    });
  });
});
