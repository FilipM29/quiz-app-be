import createServer from "~/server";
import type {FastifyInstance} from "fastify";
import {QuizStatus, QuizType, User} from "@prisma/client";

let server: FastifyInstance;
let user: User;
let currentQuizId: string;
let quizName = 'TestQuiz';
describe('quiz endpoints', () => {
  beforeAll(async () => {
    server = await createServer();
    user = await server.prisma.user.create({
      data: {
        email: 'user@example.com',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        firebaseId: 'testFirebaseId',
      }
    });
  })

  afterAll(async () => {
    await server.prisma.user.delete({
      where: { id: user.id }
    })
  })

  it('should create a quiz', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/quiz',
      payload: {
        name: quizName,
        quizType: QuizType.SLIDES,
        quizStatus: QuizStatus.CONCEPT,
        numOfRounds: 5,
        numOfPlays: 5,
        rating: 10,
        authorId: user.id
      }
    });

    expect(response.statusCode).toEqual(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body.name).toEqual(quizName);
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
    expect(body.name).toEqual(quizName);
  })

  it('should get all quizzes', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/quiz/all'
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
  })

  it('should update a quiz', async () => {
    const updatedName = 'UpdatedTestQuiz';
    const response = await server.inject({
      method: 'PUT',
      url: `/api/quiz/${currentQuizId}`,
      payload: {
        name: updatedName,
        quizType: QuizType.JEPARDY,
        quizStatus: QuizStatus.CONCEPT,
        numOfRounds: 10,
        numOfPlays: 10,
        rating: 10
      }
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.id).toEqual(currentQuizId);
    expect(body.name).toEqual(updatedName);
    expect(body.quizType).toEqual(QuizType.JEPARDY);
    expect(body.numOfRounds).toEqual(10);
    expect(body.numOfPlays).toEqual(10);
  })

  it('should delete a quiz', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/quiz/${currentQuizId}`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('quiz deleted!');
  })
});
