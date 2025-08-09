import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

const getUserId = () => 'demo-user';

export const GET: RequestHandler = async ({ params }) => {
  const userId = getUserId();
  const id = params?.id;
  if (!id) return new Response('Bad Request', { status: 400 });
  const snaps = await prisma.fundPeriodSnapshot.findMany({
    where: { userId, fundId: id },
    orderBy: [{ createdAt: 'asc' }]
  });
  // Map to simple series: { periodId, openingCents, closingCents }
  const series = snaps.map((s: { periodId: string; openingCents: number; closingCents: number | null }) => ({ periodId: s.periodId, openingCents: s.openingCents, closingCents: s.closingCents ?? null }));
  return new Response(JSON.stringify(series), { headers: { 'content-type': 'application/json' } });
};
