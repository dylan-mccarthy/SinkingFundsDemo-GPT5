import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { z } from 'zod';
import { getRules, previewAllocations } from '$lib/server/services/allocations/engine';
import { assignPeriodId } from '$lib/server/services/util/transactions';

const getUserId = () => 'demo-user';

export const POST: RequestHandler = async ({ request }) => {
  // Start-of-month: rollover then allocations
  const userId = getUserId();
  const schema = z.object({ year: z.number().int(), month: z.number().int(), depositCents: z.number().int().default(0) });
  const data = schema.parse(await request.json());
  // ensure/open period
  const date = new Date(Date.UTC(data.year, data.month - 1, 1));
  const periodId = await assignPeriodId(date, userId);

  // Create opening snapshots for each active fund using current balance
  const funds = await prisma.fund.findMany({ where: { userId, active: true } });
  const grouped = await prisma.transaction.groupBy({ by: ['fundId'], where: { userId }, _sum: { amountCents: true } });
  const balMap = new Map<string, number>(
    (grouped as Array<{ fundId: string | null; _sum: { amountCents: number | null } }>)
      .filter((g) => g.fundId !== null)
      .map((g) => [g.fundId as string, g._sum.amountCents ?? 0])
  );
  await prisma.$transaction(
    funds.map((f: { id: string }) =>
      prisma.fundPeriodSnapshot.upsert({
        where: { userId_periodId_fundId: { userId, periodId, fundId: f.id } },
        update: { openingCents: balMap.get(f.id) ?? 0 },
        create: { userId, periodId, fundId: f.id, openingCents: balMap.get(f.id) ?? 0 }
      })
    )
  );

  // Allocation preview and apply as transactions of type ALLOCATION
  const rules = await getRules(userId);
  const allocs = previewAllocations(data.depositCents, rules);
  const run = await prisma.allocationRun.create({ data: { userId, periodId, depositCents: data.depositCents, hash: crypto.randomUUID() } });
  await prisma.$transaction(
    allocs.map((a) =>
      prisma.transaction.create({ data: { userId, periodId, fundId: a.fundId, type: 'ALLOCATION', amountCents: a.amountCents, date, tags: [] } })
    )
  );
  for (const a of allocs) {
    await prisma.allocationLine.create({ data: { allocationRunId: run.id, fundId: a.fundId, amountCents: a.amountCents } });
  }

  return new Response(JSON.stringify({ periodId, runId: run.id, allocations: allocs }), { status: 201, headers: { 'content-type': 'application/json' } });
};
