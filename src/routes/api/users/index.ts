import type { FastifyPluginCallback } from 'fastify';
import {
  createUserOpt,
  getUserByIdOpt,
  getUserByFirebaseIdOpt,
  getAllUsersOpt,
  updateUserOpt,
  deleteUserOpt
} from './schema';

const userRoutes: FastifyPluginCallback = (fastify, _opts, done) => {
  // POST /users - Create a new user (public for registration)
  fastify.post('', createUserOpt());

  // GET /users/firebase/:firebaseId - Get a user by Firebase ID (requires authentication)
  // Must be registered before /:id to avoid route conflicts
  fastify.get('/firebase/:firebaseId', {
    preHandler: [fastify.requireAuth],
    ...getUserByFirebaseIdOpt()
  });

  // GET /users/:id - Get a user by ID (requires authentication and ownership)
  fastify.get('/:id', {
    preHandler: [fastify.requireAuth],
    ...getUserByIdOpt()
  });

  // GET /users - Get all users (requires authentication)
  fastify.get('', {
    preHandler: [fastify.requireAuth],
    ...getAllUsersOpt()
  });

  // PUT /users/:id - Update a user (requires authentication and ownership)
  fastify.put('/:id', {
    preHandler: [fastify.requireAuth],
    ...updateUserOpt()
  });

  // DELETE /users/:id - Delete a user (requires authentication and ownership)
  fastify.delete('/:id', {
    preHandler: [fastify.requireAuth],
    ...deleteUserOpt()
  });

  done();
};

export default userRoutes;
