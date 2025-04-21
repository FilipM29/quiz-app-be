import { QuizService } from '~/services/quiz';
import { Quiz, QuizStatus, QuizType, QuizVisibility } from '@prisma/client';
import { messages } from '~/resources';
import { FastifyReply, FastifyRequest } from 'fastify';
import { RoundsService } from '~/services/rounds';

export const createQuiz = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as {
    title: string;
    description: string;
    pictureUrl?: string;
    quizVisibility: QuizVisibility;
    quizType: QuizType;
    quizStatus: QuizStatus;
    numOfRounds: number;
    authorId: string;
  };

  const quiz = await QuizService.createQuiz(
    body.title,
    body.description,
    body.pictureUrl,
    body.quizType,
    body.quizStatus,
    body.quizVisibility,
    body.numOfRounds,
    body.authorId
  );
  reply.status(201).send(quiz);
};

export const getQuizById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const quiz = await QuizService.findQuiz(id);
    reply.status(200).send(quiz);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('quiz', id) });
  }
};

export const getAllQuizzes = async (
  _req: FastifyRequest,
  reply: FastifyReply
) => {
  const quizzes = await QuizService.findQuizzes();
  reply.status(200).send(quizzes);
};

export const getMyQuizzes = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };
  const quizzes = await QuizService.findMyQuizzes(id);
  reply.status(200).send(quizzes);
};

export const updateQuiz = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { data } = req.body as {
    data: Partial<Omit<Quiz, 'id'>>;
  };

  try {
    const quiz = await QuizService.updateQuiz(id, data);
    reply.status(200).send(quiz);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('quiz', id) });
  }
};

export const deleteQuiz = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const result = await QuizService.deleteQuiz(id);
    reply.status(200).send(result);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('quiz', id) });
  }
};

export const getRoundsByQuizId = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  try {
    const rounds = await RoundsService.getRoundsByQuizId(id);
    reply.status(200).send(rounds);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('quiz', id) });
  }
};
