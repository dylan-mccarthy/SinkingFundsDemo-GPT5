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
