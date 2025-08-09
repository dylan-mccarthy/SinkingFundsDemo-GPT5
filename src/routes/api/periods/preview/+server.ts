import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { getRules, previewAllocations } from '$lib/server/services/allocations/engine';

const getUserId = () => 'demo-user';

export const GET: RequestHandler = async ({ url }) => {
  const userId = getUserId();
  const year = Number(url.searchParams.get('year'));
  const month = Number(url.searchParams.get('month'));
  const depositCents = Number(url.searchParams.get('depositCents') ?? '0');
  if (!year || !month) return new Response('Bad Request', { status: 400 });

  // snapshot balances now for carry-forward preview
  const funds = await prisma.fund.findMany({ where: { userId, active: true } });
  const grouped = await prisma.transaction.groupBy({ by: ['fundId'], where: { userId }, _sum: { amountCents: true } });
  const balMap = new Map<string, number>(
    (grouped as Array<{ fundId: string | null; _sum: { amountCents: number | null } }>)
      .filter((g) => g.fundId !== null)
      .map((g) => [g.fundId as string, g._sum.amountCents ?? 0])
  );

  const rules = await getRules(userId);
  const allocations = previewAllocations(depositCents, rules);

  const carry = funds.map((f: { id: string; name: string }) => ({ fundId: f.id, name: f.name, balanceCents: balMap.get(f.id) ?? 0 }));

  return new Response(JSON.stringify({ year, month, depositCents, carry, allocations }), { headers: { 'content-type': 'application/json' } });
};
