import { PrismaClient } from '@prisma/client';

// Ensure a single Prisma instance in dev (Vite HMR)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
