import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
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
  const created = await prisma.transaction.create({
    data: {
      userId,
      fundId: data.fundId ?? null,
      type: data.type as any,
      amountCents: data.amountCents,
      date: new Date(data.date),
      payee: data.payee ?? null,
      note: data.note ?? null,
      tags: data.tags
    }
  });
  return new Response(JSON.stringify(created), { status: 201, headers: { 'content-type': 'application/json' } });
};
