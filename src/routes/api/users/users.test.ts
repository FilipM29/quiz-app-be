jest.mock('firebase-admin');

import type { FastifyInstance } from 'fastify';
import type { User } from '@prisma/client';
import createServer from '~/server';
import { createAuthHeaders } from '~/utils/test-helpers';

let server: FastifyInstance;
let userId: string;
let mainUser: User;
let otherUser: User;
const firebaseId = `testFirebaseId-${Date.now()}`;
const firstName = 'testFirstName';
const lastName = 'testLastName';
const email = `test-${Date.now()}@Email.com`;

describe('users endpoints', () => {
  beforeAll(async () => {
    server = await createServer();

    // Create the main test user for authentication tests
    mainUser = await server.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        firebaseId
      }
    });
    userId = mainUser.id;

    // Create another user for authorization testing
    otherUser = await server.prisma.user.create({
      data: {
        email: `other-${Date.now()}@example.com`,
        firstName: 'otherFirstName',
        lastName: 'otherLastName',
        firebaseId: `otherTestFirebaseId-${Date.now()}`
      }
    });
  });

  it('should create a user (POST /users)', async () => {
    const newEmail = `newuser-${Date.now()}@example.com`;
    const newFirebaseId = `newUserFirebaseId-${Date.now()}`;

    const response = await server.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        email: newEmail,
        firstName: 'New',
        lastName: 'User',
        firebaseId: newFirebaseId
      }
    });

    expect(response.statusCode).toEqual(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body.email).toEqual(newEmail);
  });

  it('should get a user by ID (GET /users/{id})', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/users/${userId}`,
      headers: createAuthHeaders(firebaseId)
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.id).toEqual(userId);
    expect(body.email).toEqual(email);
  });

  it('should get all users (GET /users)', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/users',
      headers: createAuthHeaders(firebaseId)
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('should update a user (PUT /users)', async () => {
    const updatedEmail = 'updatedTest@Email.com';
    const response = await server.inject({
      method: 'PUT',
      url: `/api/users/${userId}`,
      headers: createAuthHeaders(firebaseId),
      payload: {
        email: updatedEmail
      }
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.id).toEqual(userId);
    expect(body.email).toEqual(updatedEmail);
  });

  it('should delete a user (DELETE /users)', async () => {
    // Create a dedicated user for deletion test
    const deleteFirebaseId = `deleteUser-${Date.now()}`;
    const deleteUser = await server.prisma.user.create({
      data: {
        email: `delete-${Date.now()}@example.com`,
        firstName: 'Delete',
        lastName: 'User',
        firebaseId: deleteFirebaseId
      }
    });

    const response = await server.inject({
      method: 'DELETE',
      url: `/api/users/${deleteUser.id}`,
      headers: createAuthHeaders(deleteFirebaseId)
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('User deleted!');

    // Verify the user no longer exists - should fail due to authentication
    // since we can't authenticate as a deleted user
    const getResponse = await server.inject({
      method: 'GET',
      url: `/api/users/${deleteUser.id}`,
      headers: createAuthHeaders(deleteFirebaseId)
    });
    expect(getResponse.statusCode).toEqual(401);
  });

  it('should fail to get user without authentication', async () => {
    // Create a user first for this test
    const noAuthFirebaseId = `noAuthFirebaseId-${Date.now()}`;
    const testResponse = await server.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        email: `noauth-${Date.now()}@example.com`,
        firstName: 'NoAuth',
        lastName: 'User',
        firebaseId: noAuthFirebaseId
      }
    });
    const testUserId = JSON.parse(testResponse.body).id;

    const response = await server.inject({
      method: 'GET',
      url: `/api/users/${testUserId}`
    });

    expect(response.statusCode).toEqual(401);

    // Clean up
    await server.inject({
      method: 'DELETE',
      url: `/api/users/${testUserId}`,
      headers: createAuthHeaders(noAuthFirebaseId)
    });
  });

  it("should fail to access other user's profile", async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/users/${otherUser.id}`,
      headers: createAuthHeaders(firebaseId)
    });

    expect(response.statusCode).toEqual(403);
  });

  it('should fail to get all users without authentication', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/users'
    });

    expect(response.statusCode).toEqual(401);
  });

  it('should fail to update user without authentication', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/api/users/${otherUser.id}`,
      payload: {
        email: 'hacked@example.com'
      }
    });

    expect(response.statusCode).toEqual(401);
  });

  it("should fail to update other user's profile", async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/api/users/${otherUser.id}`,
      headers: createAuthHeaders(firebaseId),
      payload: {
        email: 'hacked@example.com'
      }
    });

    expect(response.statusCode).toEqual(403);
  });

  it('should fail to delete user without authentication', async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/users/${otherUser.id}`
    });

    expect(response.statusCode).toEqual(401);
  });

  it("should fail to delete other user's profile", async () => {
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/users/${otherUser.id}`,
      headers: createAuthHeaders(firebaseId)
    });

    expect(response.statusCode).toEqual(403);
  });

  afterAll(async () => {
    // Clean up test users
    await server.prisma.user.delete({
      where: { id: mainUser.id }
    });

    await server.prisma.user.delete({
      where: { id: otherUser.id }
    });
  });
});
