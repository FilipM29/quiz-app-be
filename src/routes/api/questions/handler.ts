import type { FastifyReply, FastifyRequest } from 'fastify';
import { QuestionsService } from '~/services/questions';
import { messages } from '~/resources';
import type {
  QuestionType,
  User,
  Question,
  AnswerOption
} from '@prisma/client';
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
      'You can only modify questions in your own quizzes'
    );
  }
}

async function requireQuizOwnershipForQuestion(user: User, questionId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: {
      round: {
        include: { quiz: true }
      }
    }
  });

  if (!question) {
    throw new Error('Question not found');
  }

  if (question.round.quiz.authorId !== user.id) {
    throw new AccessForbiddenError(
      'You can only modify questions in your own quizzes'
    );
  }
}

export const createQuestion = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const {
    roundId,
    text,
    value,
    type,
    answer,
    acceptableAnswers,
    options,
    range,
    pictureUrl
  } = req.body as {
    roundId: string;
    text: string;
    value: number;
    type: QuestionType;
    answer: string;
    acceptableAnswers: string[];
    options: string[];
    range?: number;
    pictureUrl?: string;
  };

  try {
    // Check if user owns the quiz for this round
    await requireQuizOwnershipForRound(req.user!, roundId);

    const question = await QuestionsService.createQuestion(
      roundId,
      text,
      value,
      type,
      answer,
      acceptableAnswers,
      range,
      options,
      pictureUrl
    );
    reply.status(201).send(transformQuestionForResponse(question));
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(400).send({
      message: error instanceof Error ? error.message : 'Bad request'
    });
  }
};

export const getQuestionById = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  try {
    const question = await QuestionsService.getQuestionById(id);
    reply.status(200).send(transformQuestionForResponse(question));
  } catch {
    reply.status(404).send({ message: messages.notFound('Question', id) });
  }
};

export const updateQuestion = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };
  const {
    text,
    value,
    type,
    answer,
    acceptableAnswers,
    options,
    range,
    pictureUrl
  } = req.body as {
    text?: string;
    value?: number;
    type?: QuestionType;
    answer?: string;
    acceptableAnswers?: string[];
    range?: number;
    options?: string[];
    pictureUrl?: string;
  };

  try {
    // Check if user owns the quiz for this question
    await requireQuizOwnershipForQuestion(req.user!, id);

    const question = await QuestionsService.updateQuestion(
      id,
      text,
      value,
      type,
      answer,
      acceptableAnswers,
      range,
      options,
      pictureUrl
    );
    reply.status(200).send(transformQuestionForResponse(question));
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(404).send({ message: messages.notFound('Question', id) });
  }
};

export const deleteQuestion = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  try {
    // Check if user owns the quiz for this question
    await requireQuizOwnershipForQuestion(req.user!, id);

    const result = await QuestionsService.deleteQuestion(id);
    reply.status(200).send(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(404).send({ message: messages.notFound('Question', id) });
  }
};
