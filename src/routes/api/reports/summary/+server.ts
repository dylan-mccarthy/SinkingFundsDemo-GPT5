import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

const getUserId = () => 'demo-user';

export const GET: RequestHandler = async () => {
  const userId = getUserId();
  const total = await prisma.transaction.aggregate({ where: { userId }, _sum: { amountCents: true } });
  const funds = await prisma.fund.findMany({ where: { userId, active: true }, orderBy: { displayOrder: 'asc' } });
  return new Response(JSON.stringify({ totalCents: total._sum.amountCents ?? 0, funds }), { headers: { 'content-type': 'application/json' } });
};
