import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent creating new connections to the DB in development (hot reloading)
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }

  prisma = global.__prisma;
}

export { prisma };
