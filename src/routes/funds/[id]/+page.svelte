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

  async function load() {
    const id = get(page).params.id;
    const f = await fetch(`/api/funds/${id}`);
    if (f.ok) fund = await f.json();
    const t = await fetch(`/api/transactions`);
  if (t.ok) txs = (await t.json() as Tx[]).filter((x) => x.fundId === id);
  }

  async function addExpense() {
    const id = get(page).params.id;
    const body = { fundId: id, type: 'EXPENSE', amountCents: Math.round(amount*100), date };
    const res = await fetch('/api/transactions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { amount = 0; await load(); }
  }

  onMount(load);
</script>

{#if !fund}
  <p>Loading…</p>
{:else}
  <h1 class="text-2xl font-bold mb-4">{fund.name}</h1>
  <div class="mb-6">
    <label class="mr-2" for="amt">Amount</label>
    <input id="amt" class="input w-40 mr-2" type="number" min="0" step="0.01" bind:value={amount} />
    <label class="mr-2" for="dt">Date</label>
    <input id="dt" class="input w-40 mr-2" type="date" bind:value={date} />
    <button class="btn" on:click={addExpense}>Add Expense</button>
  </div>

  <h2 class="text-xl font-semibold mb-2">Transactions</h2>
  <ul class="space-y-2">
    {#each txs as t}
      <li class="p-2 border rounded-xl flex justify-between">
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
