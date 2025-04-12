import type { FastifyInstance, FastifySchema } from 'fastify';
import { Type } from '@sinclair/typebox';
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
} from './handler';

// User schema
const User = Type.Object({
  id: Type.String(),
  email: Type.String({ format: 'email' }),
  firstName: Type.String(),
  lastName: Type.String(),
  firebaseId: Type.String()
});

// POST /users schema
const createUserSchema: FastifySchema = {
  description: 'Create a new user',
  tags: ['users'],
  body: Type.Pick(User, ['email', 'firstName', 'lastName', 'firebaseId']),
  response: {
    201: User
  }
};

// GET /users/:id schema
const getUserByIdSchema: FastifySchema = {
  description: 'Get a user by ID',
  tags: ['users'],
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: User,
    404: Type.Object({
      message: Type.String()
    })
  }
};

// GET /users schema
const getAllUsersSchema: FastifySchema = {
  description: 'Get all users',
  tags: ['users'],
  response: {
    200: Type.Array(User)
  }
};

// PUT /users/:id schema
const updateUserSchema: FastifySchema = {
  description: 'Update a user by ID',
  tags: ['users'],
  params: Type.Object({
    id: Type.String()
  }),
  body: Type.Pick(User, ['email', 'firstName', 'lastName']),
  response: {
    200: User,
    404: Type.Object({
      message: Type.String()
    })
  }
};

// DELETE /users/:id schema
const deleteUserSchema: FastifySchema = {
  description: 'Delete a user by ID',
  tags: ['users'],
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: Type.Object({
      message: Type.String()
    }),
    404: Type.Object({
      message: Type.String()
    })
  }
};

// Export options for each endpoint
export const createUserOpt = (_fastify: FastifyInstance) => ({
  schema: createUserSchema,
  handler: createUser
});

export const getUserByIdOpt = (_fastify: FastifyInstance) => ({
  schema: getUserByIdSchema,
  handler: getUserById
});

export const getAllUsersOpt = (_fastify: FastifyInstance) => ({
  schema: getAllUsersSchema,
  handler: getAllUsers
});

export const updateUserOpt = (_fastify: FastifyInstance) => ({
  schema: updateUserSchema,
  handler: updateUser
});

export const deleteUserOpt = (_fastify: FastifyInstance) => ({
  schema: deleteUserSchema,
  handler: deleteUser
});
