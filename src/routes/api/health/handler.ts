import type { FastifyReply, FastifyRequest } from 'fastify';

export const getHealth = async (_req: FastifyRequest, reply: FastifyReply) => {
  await reply.status(200).send({ message: 'OK' });
};
