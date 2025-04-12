import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '~/services/user';
import { messages } from '~/resources';

export const createUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { email, firstName, lastName, firebaseId } = req.body as {
    email: string;
    firstName: string;
    lastName: string;
    firebaseId: string;
  };

  const user = await UserService.createUser(
    email,
    firstName,
    lastName,
    firebaseId
  );
  reply.status(201).send(user);
};

export const getUserById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const user = await UserService.findUser(id);
    reply.status(200).send(user);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('user', id) });
  }
};

export const getAllUsers = async (
  _req: FastifyRequest,
  reply: FastifyReply
) => {
  const users = await UserService.findUsers();
  reply.status(200).send(users);
};

export const updateUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const { email, firstName, lastName } = req.body as {
    email: string;
    firstName: string;
    lastName: string;
  };

  try {
    const user = await UserService.updateUser(id, email, firstName, lastName);
    reply.status(200).send(user);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('user', id) });
  }
};

export const deleteUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    const result = await UserService.deleteUser(id);
    reply.status(200).send(result);
  } catch (error) {
    reply.status(404).send({ message: messages.notFound('user', id) });
  }
};
