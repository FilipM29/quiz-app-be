import { FastifyReply, FastifyRequest } from 'fastify';
import { RoundsService } from '~/services/rounds';
import { messages } from '~/resources';
import { QuestionsService } from '~/services/questions';

export const createRound = async (req: FastifyRequest, reply: FastifyReply) => {
  const { quizId, order, title } = req.body as {
    quizId: string;
    order: number;
    title: string;
  };

  const round = await RoundsService.createRound(quizId, order, title);
  reply.status(201).send(round);
};

export const getRoundById = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  try {
    const round = await RoundsService.getRoundById(id);
    reply.status(200).send(round);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('Round', id) });
  }
};

export const updateRound = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { title, order } = req.body as { title: string; order: number };

  try {
    const round = await RoundsService.updateRound(id, title, order);
    reply.status(200).send(round);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('Round', id) });
  }
};

export const deleteRound = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const result = await RoundsService.deleteRound(id);
    reply.status(200).send(result);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('Round', id) });
  }
};

export const getQuestionsByRoundId = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = req.params as { id: string };

  const questions = await QuestionsService.getQuestionsByRoundId(id);
  reply.status(200).send(questions);
};
