import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { z } from 'zod';

const getUserId = () => 'demo-user';

export const PATCH: RequestHandler = async ({ params, request }) => {
  const userId = getUserId();
  const schema = z.object({ mode: z.enum(['fixed','percent','priority']).optional(), fixedCents: z.number().int().nullable().optional(), percentBp: z.number().int().nullable().optional(), priority: z.number().int().optional(), active: z.boolean().optional() });
  const body = schema.parse(await request.json());
  const updated = await prisma.allocationRule.update({ where: { id: params!.id }, data: body });
  if (updated.userId !== userId) return new Response('Forbidden', { status: 403 });
  return new Response(JSON.stringify(updated), { headers: { 'content-type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ params }) => {
  const userId = getUserId();
  const rule = await prisma.allocationRule.findUnique({ where: { id: params!.id } });
  if (!rule || rule.userId !== userId) return new Response('Not found', { status: 404 });
  await prisma.allocationRule.delete({ where: { id: rule.id } });
  return new Response(null, { status: 204 });
};
