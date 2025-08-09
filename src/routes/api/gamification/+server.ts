import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

const getUserId = () => 'demo-user';

function monthsWithoutOverspend(): number {
  // Placeholder: compute streak based on negative balances or flags
  return 3;
}

function levelFromBalance(totalCents: number): number {
  // Simple level curve: every $1k raises a level
  return Math.floor(totalCents / 100_000);
}

export const GET: RequestHandler = async () => {
  const userId = getUserId();
  const grouped = await prisma.transaction.aggregate({ where: { userId }, _sum: { amountCents: true } });
  const total = grouped._sum.amountCents ?? 0;
  const streak = monthsWithoutOverspend();
  const level = levelFromBalance(total);
  const badges: string[] = [];
  if (total >= 100_000) badges.push('Saved $1k');
  if (total >= 1_000_000) badges.push('Saved $10k');
  return new Response(JSON.stringify({ streakMonths: streak, level, badges }), { headers: { 'content-type': 'application/json' } });
};
