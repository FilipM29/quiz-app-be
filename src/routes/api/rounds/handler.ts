import type { FastifyReply, FastifyRequest } from 'fastify';
import { RoundsService } from '~/services/rounds';
import { messages } from '~/resources';
import { QuestionsService } from '~/services/questions';
import type { User, Question, AnswerOption } from '@prisma/client';
import { prisma } from '~/utils';
import { AccessForbiddenError } from '~/models/error';

// Helper function to transform Question with AnswerOption[] to API response format with string[]
function transformQuestionForResponse(
  question: Question & { options: AnswerOption[] }
) {
  return {
    ...question,
    options: question.options.map((opt) => opt.text)
  };
}

async function requireQuizOwnershipForRound(user: User, roundId: string) {
  const round = await prisma.quizRound.findUnique({
    where: { id: roundId },
    include: { quiz: true }
  });

  if (!round) {
    throw new Error('Round not found');
  }

  if (round.quiz.authorId !== user.id) {
    throw new AccessForbiddenError(
      'You can only modify rounds in your own quizzes'
    );
  }
}

async function requireQuizOwnershipForQuiz(user: User, quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId }
  });

  if (!quiz) {
    throw new Error('Quiz not found');
  }

  if (quiz.authorId !== user.id) {
    throw new AccessForbiddenError(
      'You can only modify rounds in your own quizzes'
    );
  }
}

export const createRound = async (req: FastifyRequest, reply: FastifyReply) => {
  const { quizId, order, title } = req.body as {
    quizId: string;
    order: number;
    title: string;
  };

  try {
    // Check if user owns the quiz
    await requireQuizOwnershipForQuiz(req.user!, quizId);

    const round = await RoundsService.createRound(quizId, order, title);
    reply.status(201).send(round);
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(400).send({
      message: error instanceof Error ? error.message : 'Bad request'
    });
  }
};

export const getRoundById = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  try {
    const round = await RoundsService.getRoundById(id);
    reply.status(200).send(round);
  } catch {
    reply.status(404).send({ message: messages.notFound('Round', id) });
  }
};

export const updateRound = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { title, order } = req.body as { title: string; order: number };

  try {
    // Check if user owns the quiz for this round
    await requireQuizOwnershipForRound(req.user!, id);

    const round = await RoundsService.updateRound(id, title, order);
    reply.status(200).send(round);
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(404).send({ message: messages.notFound('Round', id) });
  }
};

export const deleteRound = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    // Check if user owns the quiz for this round
    await requireQuizOwnershipForRound(req.user!, id);

    const result = await RoundsService.deleteRound(id);
    reply.status(200).send(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(404).send({ message: messages.notFound('Round', id) });
  }
};

export const getQuestionsByRoundId = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  const questions = await QuestionsService.getQuestionsByRoundId(id);
  const transformedQuestions = questions.map(transformQuestionForResponse);
  reply.status(200).send(transformedQuestions);
};
