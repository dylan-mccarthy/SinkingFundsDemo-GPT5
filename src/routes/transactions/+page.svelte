<script lang="ts">
  import { onMount } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';

  type Tx = { id: string; type: string; amountCents: number; date: string; fundId?: string | null; payee?: string | null };
  let txs: Tx[] = [];
  let q = '';
  let type = 'ALL';

  async function load() {
    const res = await fetch('/api/transactions');
    if (res.ok) txs = await res.json();
  }

  onMount(load);
</script>

<div class="flex items-center justify-between mb-4">
  <h1 class="text-2xl font-bold">Transactions</h1>
  <div class="flex gap-2">
    <a class="btn-soft" href="/api/export/csv" download title="Export CSV"><Icon name="receipt" /> Export</a>
    <a class="btn-soft" href="/" title="Home"><Icon name="home" /> Home</a>
  </div>
  </div>

<div class="card mb-4">
  <div class="card-header"><span class="title">Filter</span><Icon name="adjustments" /></div>
  <div class="card-body flex gap-3 items-end flex-wrap">
    <label class="block">
      <span class="text-xs muted">Search</span>
      <input class="input w-64" bind:value={q} placeholder="Payee, note, date…" aria-label="Search" />
    </label>
    <label class="block">
      <span class="text-xs muted">Type</span>
      <select class="input w-48" bind:value={type} aria-label="Type">
        <option value="ALL">All</option>
        <option value="EXPENSE">Expense</option>
        <option value="INCOME">Income</option>
        <option value="TRANSFER_OUT">Transfer Out</option>
        <option value="TRANSFER_IN">Transfer In</option>
        <option value="ALLOCATION">Allocation</option>
      </select>
    </label>
  </div>
  </div>

<ul class="space-y-2">
  {#each txs.filter((t) => (type==='ALL' || t.type===type) && (q.trim()==='' || (t.payee??'').toLowerCase().includes(q.toLowerCase()) || t.date.includes(q))) as t}
    <li class="p-3 border rounded-xl flex justify-between">
      <div class="flex gap-2">
        <span class="font-mono text-xs">{t.date.slice(0,10)}</span>
        <span class="uppercase text-xs">{t.type}</span>
      </div>
      <div class="font-mono">{(t.amountCents/100).toFixed(2)}</div>
    </li>
  {/each}
  {#if txs.length === 0}
    <li class="text-surface-500">No transactions yet.</li>
  {/if}
</ul>
