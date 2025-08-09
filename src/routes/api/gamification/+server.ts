import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

const getUserId = () => 'demo-user';

type FundLevel = { fundId: string; name: string; level: number; balanceCents: number };

function levelCurve(cents: number): number {
  // Diminishing returns: levels at $500, $1k, $2k, $4k, $8k ...
  let lvl = 0;
  let threshold = 50_000; // $500
  while (cents >= threshold && lvl < 20) {
    lvl++;
    threshold *= 2;
  }
  return lvl;
}

async function computeStreakMonths(userId: string): Promise<number> {
  // Count consecutive most-recent CLOSED or OPEN periods with no negative end balance per fund
  const periods = await prisma.period.findMany({ where: { userId }, orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 12 });
  if (periods.length === 0) return 0;
  let streak = 0;
  for (const p of periods) {
    // Prefer closing snapshot; fallback to live balance for OPEN periods
    const snaps = await prisma.fundPeriodSnapshot.findMany({ where: { userId, periodId: p.id } });
    let ok = true;
    if (snaps.length > 0) {
      for (const s of snaps) {
        const end = (p.status === 'CLOSED' ? (s.closingCents ?? s.openingCents ?? 0) : s.openingCents ?? 0);
        if (end < 0) { ok = false; break; }
      }
    } else {
      // No snapshots yet: compute current balances as proxy
      const grouped = await prisma.transaction.groupBy({ by: ['fundId'], where: { userId }, _sum: { amountCents: true } });
      for (const g of grouped as Array<{ fundId: string | null; _sum: { amountCents: number | null } }>) {
        if (g.fundId && (g._sum.amountCents ?? 0) < 0) { ok = false; break; }
      }
    }
    if (ok) streak++; else break;
  }
  return streak;
}

async function computeFundLevels(userId: string): Promise<FundLevel[]> {
  const funds = await prisma.fund.findMany({ where: { userId, active: true }, orderBy: { displayOrder: 'asc' } });
  const grouped = await prisma.transaction.groupBy({ by: ['fundId'], where: { userId }, _sum: { amountCents: true } });
  const bal = new Map<string, number>(
    (grouped as Array<{ fundId: string | null; _sum: { amountCents: number | null } }>)
      .filter((g) => g.fundId !== null)
      .map((g) => [g.fundId as string, g._sum.amountCents ?? 0])
  );
  return funds.map((f: { id: string; name: string }) => ({ fundId: f.id, name: f.name, balanceCents: bal.get(f.id) ?? 0, level: levelCurve(bal.get(f.id) ?? 0) }));
}

function badgesFromTotals(totalCents: number): string[] {
  const out: string[] = [];
  if (totalCents >= 100_000) out.push('Saved $1k');
  if (totalCents >= 250_000) out.push('Saved $2.5k');
  if (totalCents >= 500_000) out.push('Saved $5k');
  if (totalCents >= 1_000_000) out.push('Saved $10k');
  return out;
}

export const GET: RequestHandler = async () => {
  const userId = getUserId();
  const [agg, streak, fundLevels] = await Promise.all([
    prisma.transaction.aggregate({ where: { userId }, _sum: { amountCents: true } }),
    computeStreakMonths(userId),
    computeFundLevels(userId)
  ]);
  const total = agg._sum.amountCents ?? 0;
  // Global level: soft curve from total across funds
  const globalLevel = levelCurve(total);
  const badges = badgesFromTotals(total);
  return new Response(
    JSON.stringify({ streakMonths: streak, level: globalLevel, badges, funds: fundLevels }),
    { headers: { 'content-type': 'application/json' } }
  );
};
