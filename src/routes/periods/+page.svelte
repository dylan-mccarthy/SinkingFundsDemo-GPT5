<script lang="ts">
  import { onMount } from 'svelte';
  let year = new Date().getUTCFullYear();
  let month = new Date().getUTCMonth() + 1;
  let deposit = 0; // dollars
  let loading = false;
  let preview: { carry: Array<{ fundId: string; name: string; balanceCents: number }>; allocations: Array<{ fundId: string; amountCents: number }> } = { carry: [], allocations: [] };
  function fmt(c: number) { return (c/100).toFixed(2); }

  async function loadPreview() {
    loading = true;
    const res = await fetch(`/api/periods/preview?year=${year}&month=${month}&depositCents=${Math.round(deposit*100)}`);
    if (res.ok) preview = await res.json();
    loading = false;
  }
  async function startMonth() {
    const res = await fetch('/api/periods', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ year, month, depositCents: Math.round(deposit*100) }) });
    if (res.ok) await loadPreview();
  }
  onMount(loadPreview);
</script>

<h1 class="text-2xl font-bold mb-4">Periods</h1>
<div class="flex gap-2 items-end mb-4">
  <label class="block">
    <span class="text-xs">Year</span>
    <input class="input w-24" type="number" bind:value={year} />
  </label>
  <label class="block">
    <span class="text-xs">Month</span>
    <input class="input w-20" type="number" min="1" max="12" bind:value={month} />
  </label>
  <label class="block">
    <span class="text-xs">Deposit ($)</span>
    <input class="input w-32" type="number" min="0" step="0.01" bind:value={deposit} />
  </label>
  <button class="btn" on:click={loadPreview}>Preview</button>
  <button class="btn" on:click={startMonth}>Start Month</button>
</div>

{#if loading}
  <p>Loading…</p>
{:else}
  <div class="grid gap-4" style="grid-template-columns: repeat(auto-fit,minmax(260px,1fr));">
    <div class="p-3 border rounded-xl">
      <div class="text-sm text-surface-500 mb-2">Carry-forward</div>
      <ul class="text-sm space-y-1">
        {#each preview.carry as c}
          <li class="flex justify-between"><span>{c.name}</span><span>${fmt(c.balanceCents)}</span></li>
        {/each}
        {#if preview.carry.length === 0}
          <li class="text-surface-500">No funds.</li>
        {/if}
      </ul>
    </div>
    <div class="p-3 border rounded-xl">
      <div class="text-sm text-surface-500 mb-2">Allocations</div>
      <ul class="text-sm space-y-1">
        {#each preview.allocations as a}
          <li class="flex justify-between"><span>{a.fundId}</span><span>${fmt(a.amountCents)}</span></li>
        {/each}
        {#if preview.allocations.length === 0}
          <li class="text-surface-500">No allocations.</li>
        {/if}
      </ul>
    </div>
  </div>
{/if}
