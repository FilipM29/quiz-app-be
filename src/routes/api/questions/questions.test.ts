import createServer from '~/server';
import type { FastifyInstance } from 'fastify';
import { User } from '@prisma/client';

let server: FastifyInstance;
let roundId: string;
let questionId: string;
let user: User;

describe('questions endpoints', () => {
  beforeAll(async () => {
    server = await createServer();

    user = await server.prisma.user.create({
      data: {
        email: 'user@example.com',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        firebaseId: 'testQuestionsFirebaseId'
      }
    });

    // Create a quiz to associate rounds with
    const quiz = await server.prisma.quiz.create({
      data: {
        title: 'Test Questions Quiz',
        description: 'A test quiz',
        quizType: 'SLIDES',
        quizStatus: 'CONCEPT',
        quizVisibility: 'PUBLIC',
        numOfRounds: 3,
        authorId: user.id
      }
    });
    // Create a round to associate questions with
    const round = await server.prisma.quizRound.create({
      data: {
        quizId: quiz.id,
        order: 1,
        title: 'Test Questions Round'
      }
    });
    roundId = round.id;
  });

  afterAll(async () => {
    await server.prisma.user.delete({
      where: { id: user.id }
    });
  });

  it('should create a question', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/questions',
      payload: {
        roundId,
        text: 'What is 2 + 2?',
        value: 10,
        type: 'EXACT',
        answer: '4',
        acceptableAnswers: ['four', '4'],
        options: ['1', '2', '3', '4']
      }
    });

    expect(response.statusCode).toEqual(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body.text).toEqual('What is 2 + 2?');
    questionId = body.id;
  });

  it('should get a question by ID', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/questions/${questionId}`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.id).toEqual(questionId);
    expect(body.text).toEqual('What is 2 + 2?');
  });

  it('should get all questions by round ID', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/rounds/${roundId}/questions`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('should update a question', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/api/questions/${questionId}`,
      payload: {
        text: 'Updated Question',
        value: 20,
        type: 'OPTIONS',
        answer: 'Updated Answer',
        acceptableAnswers: ['updated answer']
      }
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.text).toEqual('Updated Question');
    expect(body.value).toEqual(20);
    expect(body.type).toEqual('OPTIONS');
  });

  it('should delete a question', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/questions/${questionId}`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('Question deleted!');
  });
});
