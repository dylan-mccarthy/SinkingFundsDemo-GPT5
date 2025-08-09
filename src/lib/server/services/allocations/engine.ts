import { prisma } from '$lib/server/prisma';

export type Rule = { fundId: string; mode: 'fixed' | 'percent' | 'priority'; fixedCents?: number; percentBp?: number; priority?: number };
export type Allocation = { fundId: string; amountCents: number };

export async function getRules(userId: string): Promise<Rule[]> {
  const rules = await prisma.allocationRule.findMany({ where: { userId, active: true }, orderBy: [{ priority: 'asc' }] });
  return (rules as Array<{ fundId: string; mode: string; fixedCents: number | null; percentBp: number | null; priority: number }>).
    map((r) => ({ fundId: r.fundId, mode: r.mode as any, fixedCents: r.fixedCents ?? undefined, percentBp: r.percentBp ?? undefined, priority: r.priority }));
}

export function previewAllocations(depositCents: number, rules: Rule[]): Allocation[] {
  let remaining = depositCents;
  const out: Allocation[] = [];

  // Fixed first
  for (const r of rules.filter((x) => x.mode === 'fixed')) {
    const amt = Math.min(remaining, r.fixedCents ?? 0);
    out.push({ fundId: r.fundId, amountCents: amt });
    remaining -= amt;
  }
  // Percent next
  const percentRules = rules.filter((x) => x.mode === 'percent');
  for (const r of percentRules) {
    const amt = Math.floor((depositCents * (r.percentBp ?? 0)) / 10000);
    out.push({ fundId: r.fundId, amountCents: Math.min(remaining, amt) });
    remaining -= amt;
  }
  // Priority last (greedy)
  for (const r of rules.filter((x) => x.mode === 'priority').sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))) {
    if (remaining <= 0) break;
    out.push({ fundId: r.fundId, amountCents: remaining });
    remaining = 0;
  }

  return out;
}
