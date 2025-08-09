<script lang="ts">
  import { page } from '$app/stores';
  import { cents } from '$lib/format';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  type Fund = { id: string; name: string };
  type Tx = { id: string; fundId: string | null; type: string; amountCents: number; date: string };
  let fund: Fund | null = null;
  let txs: Tx[] = [];
  let amount = 0;
  let date = new Date().toISOString().slice(0,10);
  let history: Array<{ periodId: string; openingCents: number; closingCents: number|null }> = [];
  let currentBalanceCents = 0;
  let percentToTarget: number | null = null;
  let deltaCents = 0;

  async function load() {
    const id = get(page).params.id;
    const f = await fetch(`/api/funds/${id}`);
    if (f.ok) fund = await f.json();
    const t = await fetch(`/api/transactions`);
  if (t.ok) txs = (await t.json() as Tx[]).filter((x) => x.fundId === id);
    const h = await fetch(`/api/funds/${id}/history`);
    if (h.ok) history = await h.json();
    // balances
    const b = await fetch('/api/funds/balances');
    if (b.ok) {
      const all = await b.json() as Array<{ fundId: string; balanceCents: number; percentToTarget: number|null }>;
      const me = all.find((x) => x.fundId === id);
      currentBalanceCents = me?.balanceCents ?? 0;
      percentToTarget = me?.percentToTarget ?? null;
    }
    // delta (last - previous) using snapshots
    const points = history.map((h) => (h.closingCents ?? h.openingCents));
    if (points.length >= 2) deltaCents = (points[points.length - 1] ?? 0) - (points[points.length - 2] ?? 0);
    else deltaCents = 0;
  }

  async function addExpense() {
    const id = get(page).params.id;
    const body = { fundId: id, type: 'EXPENSE', amountCents: Math.round(amount*100), date };
    const res = await fetch('/api/transactions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { amount = 0; await load(); }
  }

  onMount(load);
  const SPARK_W = 120;
  const SPARK_H = 28;
  let sparkPoints = '';
  function computePoints(values: number[], width = SPARK_W, height = SPARK_H): string {
    if (!values || values.length < 2) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const step = width / (values.length - 1);
    return values.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(' ');
  }
  $: sparkPoints = computePoints(history.map((h) => (h.closingCents ?? h.openingCents)));
</script>

{#if !fund}
  <p>Loading…</p>
{:else}
  <div class="flex items-center justify-between mb-4">
    <h1 class="text-2xl font-bold break-words">{fund.name}</h1>
    <a href="/funds" class="btn-soft">Back</a>
  </div>
  <div class="grid gap-4 mb-4" style="grid-template-columns: repeat(auto-fit,minmax(220px,1fr));">
    <div class="card">
      <div class="card-header"><span class="title">Current balance</span></div>
      <div class="card-body text-xl font-bold">{cents(currentBalanceCents)}</div>
    </div>
    <div class="card">
      <div class="card-header"><span class="title">% to target</span></div>
      <div class="card-body text-xl font-bold">{percentToTarget !== null ? `${percentToTarget}%` : '—'}</div>
    </div>
    <div class="card">
      <div class="card-header"><span class="title">Change vs last period</span></div>
      <div class="card-body text-xl font-bold {deltaCents>=0 ? 'text-green-600' : 'text-red-600'}">{cents(deltaCents)}</div>
    </div>
  </div>
  <div class="mb-4 text-surface-500 text-sm">
    Balance trend
  </div>
  {#if sparkPoints}
  <svg width={SPARK_W} height={SPARK_H} viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points={sparkPoints} stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  {:else}
    <div class="text-surface-500 text-sm mb-4">No history yet. Start a period to create snapshots.</div>
  {/if}
  <div class="card mb-6">
    <div class="card-header"><span class="title">Quick expense</span></div>
    <div class="card-body">
    <label class="mr-2" for="amt">Amount</label>
    <input id="amt" class="input w-40 mr-2" type="number" min="0" step="0.01" bind:value={amount} />
    <label class="mr-2" for="dt">Date</label>
    <input id="dt" class="input w-40 mr-2" type="date" bind:value={date} />
    <button class="btn-primary" on:click={addExpense}>Add Expense</button>
    </div>
  </div>

  <h2 class="text-xl font-semibold mb-2">Transactions</h2>
  <ul class="space-y-2">
    {#each txs as t}
      <li class="p-3 border rounded-xl flex justify-between">
        <div class="flex gap-2">
          <span class="font-mono text-xs">{t.date.slice(0,10)}</span>
          <span class="uppercase text-xs">{t.type}</span>
        </div>
        <div class="font-mono">{cents(t.amountCents)}</div>
      </li>
    {/each}
    {#if txs.length === 0}
      <li class="text-surface-500">No transactions for this fund.</li>
    {/if}
  </ul>
{/if}
