import createServer from '~/server';
import type { FastifyInstance } from 'fastify';
import { User } from '@prisma/client';

let server: FastifyInstance;
let quizId: string;
let roundId: string;
let user: User;

describe('rounds endpoints', () => {
  beforeAll(async () => {
    server = await createServer();

    user = await server.prisma.user.create({
      data: {
        email: 'user@example.com',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        firebaseId: 'testRoundsFirebaseId'
      }
    });

    // Create a quiz to associate rounds with
    const quiz = await server.prisma.quiz.create({
      data: {
        title: 'Test Quiz',
        description: 'A test quiz',
        quizType: 'SLIDES',
        quizStatus: 'CONCEPT',
        quizVisibility: 'PUBLIC',
        numOfRounds: 3,
        authorId: user.id
      }
    });

    quizId = quiz.id;
  });

  afterAll(async () => {
    await server.prisma.user.delete({
      where: { id: user.id }
    });
  });

  it('should create a round', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/rounds',
      payload: {
        quizId,
        order: 1,
        title: 'Round 1'
      }
    });

    expect(response.statusCode).toEqual(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body.title).toEqual('Round 1');
    roundId = body.id;
  });

  it('should get a round by ID', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/rounds/${roundId}`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.id).toEqual(roundId);
    expect(body.title).toEqual('Round 1');
  });

  it('should get all rounds by quiz ID', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/quiz/${quizId}/rounds`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('should update a round', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/api/rounds/${roundId}`,
      payload: {
        title: 'Updated Round 1',
        order: 2
      }
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.title).toEqual('Updated Round 1');
    expect(body.order).toEqual(2);
  });

  it('should delete a round', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/rounds/${roundId}`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('Round deleted!');
  });
});
