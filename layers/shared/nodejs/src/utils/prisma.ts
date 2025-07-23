// TODO: Copy your Prisma client configuration from src/utils/prisma.ts
// This file should contain the Prisma client instance and connection management

import { PrismaClient,User } from '@prisma/client';


// Prevent multiple instances of Prisma Client in development (hot-reloading)
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') global.prisma = prisma; 
export { prisma };
export type { User };