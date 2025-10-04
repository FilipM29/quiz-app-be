import { QuizService } from '~/services/quiz';
import type {
  Quiz,
  QuizStatus,
  QuizType,
  QuizVisibility,
  Category,
  Difficulty
} from '@prisma/client';
import { messages } from '~/resources';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { RoundsService } from '~/services/rounds';
import { requireOwnership, requireQuizOwnership } from '~/utils/authorize';

export const createQuiz = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as {
    title: string;
    description: string;
    pictureUrl?: string;
    quizVisibility: QuizVisibility;
    quizType: QuizType;
    quizStatus: QuizStatus;
    numOfRounds: number;
    category: Category;
    difficulty: Difficulty;
  };

  // Use authenticated user's ID
  const quiz = await QuizService.createQuiz(
    body.title,
    body.description,
    body.pictureUrl,
    body.quizType,
    body.quizStatus,
    body.quizVisibility,
    body.numOfRounds,
    body.category,
    body.difficulty,
    req.user!.id
  );
  reply.status(201).send(quiz);
};

export const getQuizById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const quiz = await QuizService.findQuiz(id);
    reply.status(200).send(quiz);
  } catch {
    reply.status(404).send({ message: messages.notFound('Quiz', id) });
  }
};

export const getUserQuizzes = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  // Ensure user can only access their own quizzes
  requireOwnership(req.user!, id);

  const quizzes = await QuizService.findMyQuizzes(id);
  reply.status(200).send(quizzes);
};

export const updateQuiz = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const data = req.body as Partial<
    Pick<
      Quiz,
      | 'title'
      | 'description'
      | 'pictureUrl'
      | 'quizVisibility'
      | 'category'
      | 'difficulty'
      | 'numOfRounds'
      | 'quizType'
      | 'quizStatus'
    >
  >;

  try {
    // First get the quiz to check ownership
    const existingQuiz = await QuizService.findQuiz(id);
    requireQuizOwnership(req.user!, existingQuiz.authorId);

    const quiz = await QuizService.updateQuiz(id, data);
    reply.status(200).send(quiz);
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(404).send({ message: messages.notFound('Quiz', id) });
  }
};

export const deleteQuiz = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    // First get the quiz to check ownership
    const existingQuiz = await QuizService.findQuiz(id);
    requireQuizOwnership(req.user!, existingQuiz.authorId);

    const result = await QuizService.deleteQuiz(id);
    reply.status(200).send(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(404).send({ message: messages.notFound('Quiz', id) });
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
  } catch {
    reply.status(404).send({ message: messages.notFound('Quiz', id) });
  }
};
