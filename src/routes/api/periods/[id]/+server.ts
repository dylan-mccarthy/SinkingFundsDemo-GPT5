import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { log } from '$lib/server/services/audit/log';

const getUserId = () => 'demo-user';

export const PATCH: RequestHandler = async ({ params, url }) => {
  const userId = getUserId();
  const action = url.searchParams.get('action');
  const id = params!.id;
  if (action === 'close') {
    const period = await prisma.period.update({ where: { id }, data: { status: 'CLOSED', closedAt: new Date() } });
    await log(userId, 'period.close', { id });
    return new Response(JSON.stringify(period), { headers: { 'content-type': 'application/json' } });
  }
  if (action === 'reopen') {
    const period = await prisma.period.update({ where: { id }, data: { status: 'OPEN', closedAt: null } });
    await log(userId, 'period.reopen', { id });
    return new Response(JSON.stringify(period), { headers: { 'content-type': 'application/json' } });
  }
  return new Response('Bad Request', { status: 400 });
};
