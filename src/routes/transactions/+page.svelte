<script lang="ts">
  import { onMount } from 'svelte';

  type Tx = { id: string; type: string; amountCents: number; date: string; fundId?: string | null; payee?: string | null };
  let txs: Tx[] = [];

  async function load() {
    const res = await fetch('/api/transactions');
    if (res.ok) txs = await res.json();
  }

  onMount(load);
</script>

<h1 class="text-2xl font-bold mb-4">Transactions</h1>

<ul class="space-y-2">
  {#each txs as t}
    <li class="p-2 border rounded-xl flex justify-between">
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
