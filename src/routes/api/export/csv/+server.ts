import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

const getUserId = () => 'demo-user';

export const GET: RequestHandler = async () => {
  const userId = getUserId();
  const txs = await prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'asc' } });
  const header = ['id','date','type','fundId','amountCents','payee','note','tags'];
  const rows = (txs as Array<{ id: string; date: Date; type: string; fundId: string | null; amountCents: number; payee: string | null; note: string | null; tags: unknown }>).
    map((t) => [t.id, t.date.toISOString(), t.type, t.fundId ?? '', t.amountCents, t.payee ?? '', (t.note ?? '').replace(/\n/g,' '), Array.isArray(t.tags) ? (t.tags as string[]).join('|') : '']);
  const csv = [header, ...rows].map((r: unknown[]) => r.map(String).map((s: string) => s.includes(',') ? `"${s.replaceAll('"','""')}"` : s).join(',')).join('\n');
  return new Response(csv, { headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="transactions.csv"' } });
};
