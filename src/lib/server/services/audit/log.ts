import { prisma } from '$lib/server/prisma';

export async function log(userId: string, action: string, context?: unknown) {
  await prisma.auditLog.create({ data: { userId, action, context: context ? JSON.stringify(context) : null } });
}
