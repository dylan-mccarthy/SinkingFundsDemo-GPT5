import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { z } from 'zod';

const getUserId = () => 'demo-user';

export const PATCH: RequestHandler = async ({ params, request }) => {
  const userId = getUserId();
  const body = await request.json();
  const schema = z.object({ payee: z.string().optional(), note: z.string().optional(), tags: z.array(z.string()).optional() });
  const data = schema.parse(body);
  const updated = await prisma.transaction.update({ where: { id: params!.id }, data: { ...data } });
  if (updated.userId !== userId) return new Response('Forbidden', { status: 403 });
  return new Response(JSON.stringify(updated), { headers: { 'content-type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ params }) => {
  const userId = getUserId();
  const tx = await prisma.transaction.findUnique({ where: { id: params!.id } });
  if (!tx || tx.userId !== userId) return new Response('Not found', { status: 404 });
  await prisma.transaction.delete({ where: { id: tx.id } });
  return new Response(null, { status: 204 });
};
