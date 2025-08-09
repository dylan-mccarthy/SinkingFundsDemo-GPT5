import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

const getUserId = () => 'demo-user';

export const GET: RequestHandler = async ({ params }) => {
  const userId = getUserId();
  const fund = await prisma.fund.findFirst({ where: { id: params!.id, userId } });
  if (!fund) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(fund), { headers: { 'content-type': 'application/json' } });
};

export const PATCH: RequestHandler = async ({ params, request }) => {
  const userId = getUserId();
  const body = await request.json();
  // ensure only allowed fields
  const data: any = {};
  for (const k of ['name','description','color','icon','targetCents','minReserveCents','displayOrder','active'] as const) {
    if (k in body) (data as any)[k] = body[k];
  }
  const updated = await prisma.fund.update({ where: { id: params!.id }, data });
  if (updated.userId !== userId) return new Response('Forbidden', { status: 403 });
  return new Response(JSON.stringify(updated), { headers: { 'content-type': 'application/json' } });
};

export const DELETE: RequestHandler = async ({ params }) => {
  const userId = getUserId();
  const fund = await prisma.fund.findFirst({ where: { id: params!.id, userId } });
  if (!fund) return new Response('Not found', { status: 404 });
  // Soft delete: archive when non-zero, else delete
  const archived = await prisma.fund.update({ where: { id: fund.id }, data: { active: false } });
  return new Response(JSON.stringify(archived), { headers: { 'content-type': 'application/json' } });
};
