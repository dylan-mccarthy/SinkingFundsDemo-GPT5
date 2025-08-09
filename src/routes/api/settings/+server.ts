import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { z } from 'zod';

const getUserId = () => 'demo-user';

export const GET: RequestHandler = async () => {
  const userId = getUserId();
  let s = await prisma.settings.findUnique({ where: { userId } });
  if (!s) s = await prisma.settings.create({ data: { userId } });
  return new Response(JSON.stringify(s), { headers: { 'content-type': 'application/json' } });
};

export const PATCH: RequestHandler = async ({ request }) => {
  const userId = getUserId();
  const schema = z.object({ currency: z.string().optional(), timezone: z.string().optional(), monthlyDepositDay: z.number().int().min(1).max(28).optional(), overspendPrevent: z.boolean().optional() });
  const body = schema.parse(await request.json());
  const s = await prisma.settings.upsert({ where: { userId }, create: { userId, ...body }, update: body });
  return new Response(JSON.stringify(s), { headers: { 'content-type': 'application/json' } });
};
