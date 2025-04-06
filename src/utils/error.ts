import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError
} from '@prisma/client/runtime/library';
import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  AccessForbiddenError,
  AuthRequiredError,
  BadRequestError,
  NotFilledError,
  NotFoundError,
  TooManyRequestsError
} from '~/models';
import { messages } from '~/resources';

export async function errorHandler(
  error: Error,
  _req: FastifyRequest,
  reply: FastifyReply
) {
  console.log(error);
  if (error instanceof AuthRequiredError) {
    return reply.status(401).send({ msg: error.message });
  }

  if (error instanceof AccessForbiddenError) {
    return reply.status(403).send({ msg: error.message });
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({ msg: error.message });
  }

  if (error instanceof NotFoundError) {
    return reply.status(404).send({ msg: error.message });
  }

  if (error instanceof NotFilledError) {
    return reply.status(400).send({ msg: error.message });
  }

  if (error instanceof TooManyRequestsError) {
    return reply.status(429).send({ msg: error.message });
  }

  if (error instanceof PrismaClientKnownRequestError) {
    return reply.status(400).send({ msg: error.message, meta: error.meta });
  }

  if (error instanceof PrismaClientValidationError) {
    return reply.status(422).send({ msg: error.message });
  }

  return reply.status(500).send({ msg: messages.internalServerError() });
}
