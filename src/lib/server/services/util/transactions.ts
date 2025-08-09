import { prisma } from '$lib/server/prisma';

export type TxType = 'EXPENSE' | 'INCOME' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ALLOCATION';

export async function assignPeriodId(date: Date, userId: string) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  let period = await prisma.period.findFirst({ where: { userId, year, month } });
  if (!period) {
    period = await prisma.period.create({ data: { userId, year, month, status: 'OPEN', startedAt: new Date() } });
  }
  return period.id;
}

export function normalizeAmount(type: TxType, amountCents: number) {
  // Expenses and transfer out subtract; income, allocation, transfer in add
  const negative = type === 'EXPENSE' || type === 'TRANSFER_OUT';
  return negative ? -Math.abs(amountCents) : Math.abs(amountCents);
}
