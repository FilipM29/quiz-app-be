import type { FastifyInstance } from 'fastify';
import createServer from '~/server';

let server: FastifyInstance;
let userId: string;
const firebaseId = 'testFirebaseId';
const firstName = 'testFirstName';
const lastName = 'testLastName';
const email = 'test@Email.com';

describe('users endpoints', () => {
  beforeAll(async () => {
    server = await createServer();
  });

  it('should create a user (POST /users)', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/users',
      payload: {
        email,
        firstName,
        lastName,
        firebaseId
      }
    });

    expect(response.statusCode).toEqual(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('id');
    expect(body.email).toEqual(email);
    userId = body.id; // Save the user ID for later tests
  });

  it('should get a user by ID (GET /users/{id})', async () => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/users/${userId}`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.id).toEqual(userId);
    expect(body.email).toEqual(email);
  });

  it('should get all users (GET /users)', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/api/users'
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
    const response = await server.inject({
      method: 'DELETE',
      url: `/api/users/${userId}`
    });

    expect(response.statusCode).toEqual(200);
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('User deleted!');

    // Verify the user no longer exists
    const getResponse = await server.inject({
      method: 'GET',
      url: `/api/users/${userId}`
    });
    expect(getResponse.statusCode).toEqual(404);
  });
});
