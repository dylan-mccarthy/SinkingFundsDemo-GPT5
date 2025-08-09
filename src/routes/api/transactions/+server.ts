import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { assignPeriodId, normalizeAmount } from '$lib/server/services/util/transactions';
import { z } from 'zod';

const getUserId = () => 'demo-user';

const TxSchema = z.object({
  fundId: z.string().optional(),
  type: z.enum(['EXPENSE','INCOME','TRANSFER_OUT','TRANSFER_IN','ALLOCATION']),
  amountCents: z.number().int(),
  date: z.string(),
  payee: z.string().optional(),
  note: z.string().optional(),
  tags: z.array(z.string()).default([])
});

export const GET: RequestHandler = async () => {
  const userId = getUserId();
  const txs = await prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 100 });
  return new Response(JSON.stringify(txs), { headers: { 'content-type': 'application/json' } });
};

export const POST: RequestHandler = async ({ request }) => {
  const userId = getUserId();
  const body = await request.json();
  const data = TxSchema.parse(body);
  // Optional overspend prevention
  const settings = await prisma.settings.findUnique({ where: { userId } });
  if (settings?.overspendPrevent && data.type === 'EXPENSE' && data.fundId) {
    const agg = await prisma.transaction.aggregate({ where: { userId, fundId: data.fundId }, _sum: { amountCents: true } });
    const balance = (agg._sum.amountCents ?? 0);
    if (balance + normalizeAmount('EXPENSE', data.amountCents) < 0) {
      return new Response(JSON.stringify({ error: 'Overspend prevented' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }
  }
  const dateObj = new Date(data.date);
  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1;
  // Prevent creating tx in a CLOSED period
  const existing = await prisma.period.findFirst({ where: { userId, year, month } });
  if (existing && existing.status === 'CLOSED') {
    return new Response(JSON.stringify({ error: 'Period is closed. Reopen to modify.' }), { status: 409, headers: { 'content-type': 'application/json' } });
  }
  const periodId = await assignPeriodId(dateObj, userId);
  const created = await prisma.transaction.create({
    data: {
      userId,
      periodId,
      fundId: data.fundId ?? null,
  type: data.type,
  amountCents: normalizeAmount(data.type, data.amountCents),
      date: new Date(data.date),
      payee: data.payee ?? null,
      note: data.note ?? null,
      tags: data.tags
    }
  });
  return new Response(JSON.stringify(created), { status: 201, headers: { 'content-type': 'application/json' } });
};

// Transfer endpoint: POST /api/transactions?transfer=1
export const PUT: RequestHandler = async ({ request, url }) => {
  if (!url.searchParams.get('transfer')) return new Response('Bad Request', { status: 400 });
  const userId = getUserId();
  const body = await request.json();
  const schema = z.object({ fromFundId: z.string(), toFundId: z.string(), amountCents: z.number().int(), date: z.string() });
  const data = schema.parse(body);
  const groupId = crypto.randomUUID();
  const d = new Date(data.date);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const ex = await prisma.period.findFirst({ where: { userId, year: y, month: m } });
  if (ex && ex.status === 'CLOSED') {
    return new Response(JSON.stringify({ error: 'Period is closed. Reopen to modify.' }), { status: 409, headers: { 'content-type': 'application/json' } });
  }
  const periodId = await assignPeriodId(d, userId);
  const created = await prisma.$transaction([
    prisma.transaction.create({ data: { userId, periodId, fundId: data.fromFundId, type: 'TRANSFER_OUT', amountCents: normalizeAmount('TRANSFER_OUT', data.amountCents), date: new Date(data.date), transferGroupId: groupId, tags: [] } }),
    prisma.transaction.create({ data: { userId, periodId, fundId: data.toFundId, type: 'TRANSFER_IN', amountCents: normalizeAmount('TRANSFER_IN', data.amountCents), date: new Date(data.date), transferGroupId: groupId, tags: [] } })
  ]);
  return new Response(JSON.stringify(created), { status: 201, headers: { 'content-type': 'application/json' } });
};
