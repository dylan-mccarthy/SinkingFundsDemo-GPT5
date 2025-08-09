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
  const data: Partial<{ name: string; description: string | null; color: string | null; icon: string | null; targetCents: number | null; minReserveCents: number | null; displayOrder: number; active: boolean }> = {};
  type PatchKeys = 'name'|'description'|'color'|'icon'|'targetCents'|'minReserveCents'|'displayOrder'|'active';
  const keys: PatchKeys[] = ['name','description','color','icon','targetCents','minReserveCents','displayOrder','active'];
  const b = body as Partial<Record<PatchKeys, string | number | boolean | null>>;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(b, k)) {
      const v = b[k];
      (data as Record<string, string | number | boolean | null>)[k] = (v as string | number | boolean | null);
    }
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
