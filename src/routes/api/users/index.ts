import type { FastifyPluginCallback } from 'fastify';
import {
  createUserOpt,
  getUserByIdOpt,
  getAllUsersOpt,
  updateUserOpt,
  deleteUserOpt
} from './schema';

const userRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  // POST /users - Create a new user
  fastify.post('/users', createUserOpt(fastify));

  // GET /users/:id - Get a user by ID
  fastify.get('/users/:id', getUserByIdOpt(fastify));

  // GET /users - Get all users
  fastify.get('/users', getAllUsersOpt(fastify));

  // PUT /users/:id - Update a user
  fastify.put('/users/:id', updateUserOpt(fastify));

  // DELETE /users/:id - Delete a user
  fastify.delete('/users/:id', deleteUserOpt(fastify));

  done();
};

export default userRoutes;
