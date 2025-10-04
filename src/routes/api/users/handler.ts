import type { FastifyReply, FastifyRequest } from 'fastify';
import { UserService } from '~/services/user';
import { messages } from '~/resources';
import { requireOwnership } from '~/utils/authorize';

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
    // Check ownership - users can only access their own profile
    requireOwnership(req.user!, id);

    const user = await UserService.findUser(id);
    reply.status(200).send(user);
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(404).send({ message: messages.notFound('User', id) });
  }
};

export const getUserByFirebaseId = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const { firebaseId } = req.params as { firebaseId: string };

  try {
    const user = await UserService.findUserByFirebaseId(firebaseId);
    reply.status(200).send(user);
  } catch {
    reply
      .status(404)
      .send({
        message: messages.notFound('User with Firebase ID', firebaseId)
      });
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
    // Check ownership - users can only update their own profile
    requireOwnership(req.user!, id);

    const user = await UserService.updateUser(id, email, firstName, lastName);
    reply.status(200).send(user);
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(404).send({ message: messages.notFound('User', id) });
  }
};

export const deleteUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };

  try {
    // Check ownership - users can only delete their own profile
    requireOwnership(req.user!, id);

    const result = await UserService.deleteUser(id);
    reply.status(200).send(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AccessForbiddenError') {
      throw error; // Let the error handler deal with it
    }
    reply.status(404).send({ message: messages.notFound('User', id) });
  }
};
