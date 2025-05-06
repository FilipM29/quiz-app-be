import createServer from '~/server';
import type { FastifyInstance } from 'fastify';
import { QuizStatus, QuizType, User } from '@prisma/client';

let server: FastifyInstance;
let user: User;
let currentQuizId: string;
const quizTitle = 'TestQuiz';

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
  });

  afterAll(async () => {
    await server.prisma.user.delete({
      where: { id: user.id }
    });
  });

  it('should create a quiz', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/quiz',
      payload: {
        title: quizTitle,
        description: 'This is a test quiz',
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.PUBLISHED,
        quizVisibility: 'PUBLIC',
        numOfRounds: 5,
        authorId: user.id
      }
    });

    expect(response.statusCode).toEqual(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body.title).toEqual(quizTitle);
    expect(body.numOfRounds).toEqual(5);
    currentQuizId = body.id;
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

  it('should get all quizzes', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/quiz'
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('should update a quiz', async () => {
    const updatedTitle = 'UpdatedTestQuiz';
    const response = await server.inject({
      method: 'PUT',
      url: `/api/quiz/${currentQuizId}`,
      payload: {
        data: {
          title: updatedTitle,
          description: 'Updated description',
          quizType: QuizType.JEOPARDY
        }
      }
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.id).toEqual(currentQuizId);
    expect(body.title).toEqual(updatedTitle);
    expect(body.quizType).toEqual(QuizType.JEOPARDY);
    expect(body.quizStatus).toEqual(QuizStatus.PUBLISHED);
  });

  it('should delete a quiz', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/quiz/${currentQuizId}`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('Quiz deleted!');
  });

  it('should get rounds by quiz ID', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/quiz/${currentQuizId}/rounds`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0); // Assuming no rounds exist initially
  });
});
