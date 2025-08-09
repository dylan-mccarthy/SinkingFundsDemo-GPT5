import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

// NOTE: Auth is stubbed; replace with real user from session.
const getUserId = () => 'demo-user';

export const GET: RequestHandler = async () => {
  const userId = getUserId();
  const funds = await prisma.fund.findMany({
    where: { userId, active: true },
    orderBy: { displayOrder: 'asc' }
  });
  return new Response(JSON.stringify(funds), { headers: { 'content-type': 'application/json' } });
};

export const POST: RequestHandler = async ({ request }) => {
  const userId = getUserId();
  const data = await request.json();
  const fund = await prisma.fund.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? null,
      color: data.color ?? null,
      icon: data.icon ?? null,
      targetCents: data.targetCents ?? null,
      minReserveCents: data.minReserveCents ?? null,
      displayOrder: data.displayOrder ?? 0
    }
  });
  return new Response(JSON.stringify(fund), { status: 201, headers: { 'content-type': 'application/json' } });
};
