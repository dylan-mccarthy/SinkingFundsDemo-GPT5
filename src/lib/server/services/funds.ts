import { prisma } from '$lib/server/prisma';

export type Balance = {
  fundId: string;
  balanceCents: number;
};

export async function listFunds(userId: string) {
  return prisma.fund.findMany({ where: { userId, active: true }, orderBy: { displayOrder: 'asc' } });
}

export async function getFund(userId: string, id: string) {
  return prisma.fund.findFirst({ where: { id, userId } });
}

export async function computeBalances(userId: string): Promise<Balance[]> {
  // Simplified: sum transactions per fund
  const txs = await prisma.transaction.groupBy({ by: ['fundId'], where: { userId }, _sum: { amountCents: true } });
  return (txs as Array<{ fundId: string | null; _sum: { amountCents: number | null } }>)
    .filter((t) => !!t.fundId)
    .map((t) => ({ fundId: t.fundId as string, balanceCents: t._sum.amountCents ?? 0 }));
}
