import { FastifyReply, FastifyRequest } from 'fastify';
import { QuestionsService } from '~/services/questions';
import { messages } from '~/resources';
import { QuestionType } from '@prisma/client';

export const createQuestion = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { roundId, text, value, type, answer, acceptableAnswers, options } =
    req.body as {
      roundId: string;
      text: string;
      value: number;
      type: QuestionType;
      answer: string;
      acceptableAnswers: string[];
      options: string[];
    };

  const question = await QuestionsService.createQuestion(
    roundId,
    text,
    value,
    type,
    answer,
    acceptableAnswers,
    options
  );
  reply.status(201).send(question);
};

export const getQuestionById = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  try {
    const question = await QuestionsService.getQuestionById(id);
    reply.status(200).send(question);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('Question', id) });
  }
};

export const updateQuestion = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };
  const { text, value, type, answer, acceptableAnswers, options } =
    req.body as {
      text?: string;
      value?: number;
      type?: QuestionType;
      answer?: string;
      acceptableAnswers?: string[];
      options?: string[];
    };

  try {
    const question = await QuestionsService.updateQuestion(
      id,
      text,
      value,
      type,
      answer,
      acceptableAnswers,
      options
    );
    reply.status(200).send(question);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('Question', id) });
  }
};

export const deleteQuestion = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  try {
    const result = await QuestionsService.deleteQuestion(id);
    reply.status(200).send(result);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('Question', id) });
  }
};
