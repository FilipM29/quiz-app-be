import type { FastifyRequest } from 'fastify';
import { admin } from '~/config/firebase';
import { prisma } from '~/utils/prisma';
import { AuthRequiredError } from '~/models/error';

export async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch {
    throw new AuthRequiredError('Invalid authentication token');
  }
}

export async function getUserFromRequest(request: FastifyRequest) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthRequiredError('Authentication token required');
  }

  const token = authHeader.substring(7);
  const decodedToken = await verifyFirebaseToken(token);

  // Find user in database by Firebase ID
  const user = await prisma.user.findUnique({
    where: { firebaseId: decodedToken.uid }
  });

  if (!user) {
    throw new AuthRequiredError('User not found in database');
  }

  return user;
}

export async function getOptionalUserFromRequest(request: FastifyRequest) {
  try {
    return await getUserFromRequest(request);
  } catch {
    return null;
  }
}
