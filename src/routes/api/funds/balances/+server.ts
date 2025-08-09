import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

const getUserId = () => 'demo-user';

export const GET: RequestHandler = async () => {
  const userId = getUserId();
  const funds = await prisma.fund.findMany({ where: { userId, active: true } });
  const grouped = await prisma.transaction.groupBy({ by: ['fundId'], where: { userId }, _sum: { amountCents: true } });
  const map = new Map<string, number>(
    (grouped as Array<{ fundId: string | null; _sum: { amountCents: number | null } }>)
      .filter((g) => g.fundId !== null)
      .map((g) => [g.fundId as string, g._sum.amountCents ?? 0])
  );
  const result = (funds as Array<{ id: string; name: string; targetCents: number | null; color: string | null }>).
    map((f) => {
      const bal = map.get(f.id) ?? 0;
      const tgt = f.targetCents ?? null;
      const pctToTarget = tgt ? Math.min(100, Math.max(0, Math.round((bal / tgt) * 100))) : null;
      return { fundId: f.id, name: f.name, color: f.color, balanceCents: bal, targetCents: f.targetCents, percentToTarget: pctToTarget };
    });
  return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } });
};
