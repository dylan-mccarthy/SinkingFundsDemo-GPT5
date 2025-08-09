import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { z } from 'zod';
import { getRules, previewAllocations } from '$lib/server/services/allocations/engine';

const getUserId = () => 'demo-user';

export const GET: RequestHandler = async ({ url }) => {
  const userId = getUserId();
  const depositCents = Number(url.searchParams.get('depositCents') ?? '0');
  const rules = await getRules(userId);
  const preview = previewAllocations(depositCents, rules);
  return new Response(JSON.stringify({ rules, preview }), { headers: { 'content-type': 'application/json' } });
};

export const POST: RequestHandler = async ({ request }) => {
  const userId = getUserId();
  const schema = z.object({ fundId: z.string(), mode: z.enum(['fixed','percent','priority']), fixedCents: z.number().int().optional(), percentBp: z.number().int().optional(), priority: z.number().int().default(0) });
  const data = schema.parse(await request.json());
  const rule = await prisma.allocationRule.create({ data: { userId, fundId: data.fundId, mode: data.mode, fixedCents: data.fixedCents ?? null, percentBp: data.percentBp ?? null, priority: data.priority } });
  return new Response(JSON.stringify(rule), { status: 201, headers: { 'content-type': 'application/json' } });
};
