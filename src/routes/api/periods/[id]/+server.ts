import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { log } from '$lib/server/services/audit/log';

const getUserId = () => 'demo-user';

export const PATCH: RequestHandler = async ({ params, url }) => {
  const userId = getUserId();
  const action = url.searchParams.get('action');
  const id = params?.id;
  if (!id) return new Response('Bad Request', { status: 400 });
  if (action === 'close') {
    // compute and store closing balances per fund at time of close
    const funds = await prisma.fund.findMany({ where: { userId } });
    const grouped = await prisma.transaction.groupBy({ by: ['fundId'], where: { userId }, _sum: { amountCents: true } });
    const balMap = new Map<string, number>(
      (grouped as Array<{ fundId: string | null; _sum: { amountCents: number | null } }>)
        .filter((g) => g.fundId !== null)
        .map((g) => [g.fundId as string, g._sum.amountCents ?? 0])
    );
    await prisma.$transaction(
      funds.map((f: { id: string }) =>
        prisma.fundPeriodSnapshot.upsert({
          where: { userId_periodId_fundId: { userId, periodId: id, fundId: f.id } },
          update: { closingCents: balMap.get(f.id) ?? 0 },
          create: { userId, periodId: id, fundId: f.id, openingCents: balMap.get(f.id) ?? 0, closingCents: balMap.get(f.id) ?? 0 }
        })
      )
    );
    const period = await prisma.period.update({ where: { id }, data: { status: 'CLOSED', closedAt: new Date() } });
    await log(userId, 'period.close', { id });
    return new Response(JSON.stringify(period), { headers: { 'content-type': 'application/json' } });
  }
  if (action === 'reopen') {
    const period = await prisma.period.update({ where: { id }, data: { status: 'OPEN', closedAt: null } });
    await log(userId, 'period.reopen', { id });
    return new Response(JSON.stringify(period), { headers: { 'content-type': 'application/json' } });
  }
  return new Response('Bad Request', { status: 400 });
};
