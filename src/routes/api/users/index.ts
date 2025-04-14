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
  fastify.post('', createUserOpt(fastify));

  // GET /users/:id - Get a user by ID
  fastify.get('/:id', getUserByIdOpt(fastify));

  // GET /users - Get all users
  fastify.get('', getAllUsersOpt(fastify));

  // PUT /users/:id - Update a user
  fastify.put('/:id', updateUserOpt(fastify));

  // DELETE /users/:id - Delete a user
  fastify.delete('/:id', deleteUserOpt(fastify));

  done();
};

export default userRoutes;
